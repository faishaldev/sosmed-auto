const { applyCors } = require('./_cors.js');

module.exports = (req, res) => {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  res.status(200).json({
    ok: true,
    service: 'sosmed-auto-demo',
    version: '1.0.0',
    mode: process.env.DEMO_MODE === 'false' ? 'real' : 'demo',
    time: new Date().toISOString(),
    endpoints: {
      generate: 'POST /api/generate  { topic, template }',
      post:     'POST /api/post      { caption, platform }',
      webhook:  'POST /api/webhook   { topic, template, platforms, schedule, videoUrl }',
      health:   'GET  /api/health'
    }
  });
};
