const { generateCaption, TEMPLATE_KEYS } = require('../lib/templates.js');
const { applyCors, readBody } = require('./_cors.js');

// Mirrors the n8n workflow intake (workflow.n8n.json).
// External systems (n8n, Zapier, IFTTT, etc.) can POST here to push content
// into the same caption pipeline used by the dashboard.

module.exports = async (req, res) => {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await readBody(req);
  const topic    = (body.topic || '').toString().trim();
  const template = TEMPLATE_KEYS.includes(body.template) ? body.template : 'promo';
  const platforms = Array.isArray(body.platforms) && body.platforms.length
    ? body.platforms.filter(p => ['tiktok','instagram','facebook'].includes(p))
    : ['tiktok','instagram','facebook'];
  const schedule = body.schedule || new Date(Date.now() + 3600000).toISOString();
  const videoUrl = body.videoUrl || null;

  if (!topic) {
    return res.status(400).json({ error: 'Field "topic" wajib diisi.' });
  }

  try {
    const caption = generateCaption(topic, template);
    return res.status(200).json({
      status: 'queued',
      topic,
      template,
      platforms,
      schedule,
      videoUrl,
      caption,
      requestedAt: new Date().toISOString(),
      note: 'Webhook diterima. Konten masuk antrian dengan caption ter-generate. ' +
            'Untuk eksekusi posting, sambungkan ke /api/post atau ke worker n8n.'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal proses webhook.' });
  }
};
