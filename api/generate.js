const { generateCaption, TEMPLATE_KEYS } = require('../lib/templates.js');
const { applyCors, readBody } = require('./_cors.js');

module.exports = async (req, res) => {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await readBody(req);
  const topic = (body.topic || '').toString().trim();
  const template = (body.template || 'promo').toString();

  if (!topic) {
    return res.status(400).json({ error: 'Field "topic" wajib diisi.' });
  }
  if (!TEMPLATE_KEYS.includes(template)) {
    return res.status(400).json({
      error: `Template tidak dikenal. Pilihan: ${TEMPLATE_KEYS.join(', ')}.`
    });
  }

  try {
    const caption = generateCaption(topic, template);
    return res.status(200).json({
      ok: true,
      topic,
      template,
      caption,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal generate caption.' });
  }
};
