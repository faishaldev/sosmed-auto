const { applyCors, readBody } = require('./_cors.js');

// Simulated publishing endpoint.
// Real credential mode: set env vars TIKTOK_TOKEN / META_TOKEN and flip DEMO_MODE=false.
// Without credentials, this returns a realistic simulated response so the end-to-end
// flow (dashboard -> queue -> scheduled trigger -> "posted") works without setup.

const PLATFORMS = {
  tiktok:    { name: 'TikTok',          host: 'tiktok.com' },
  instagram: { name: 'Instagram Reels', host: 'instagram.com' },
  facebook:  { name: 'Facebook Page',   host: 'facebook.com' }
};

const DEMO_MODE = process.env.DEMO_MODE !== 'false';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function simulatePost(platform, caption) {
  const success = Math.random() > 0.06;
  const postId = `${platform}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  if (!success) {
    return {
      platform,
      success: false,
      error: 'Simulated rate limit (HTTP 429). Coba lagi dalam 60 detik.',
      retryAfter: 60
    };
  }
  return {
    platform,
    success: true,
    postId,
    url: `https://${PLATFORMS[platform].host}/post/${postId}`,
    postedAt: new Date().toISOString(),
    captionLength: caption.length
  };
}

module.exports = async (req, res) => {
  applyCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = await readBody(req);
  const caption = (body.caption || '').toString();
  const platform = (body.platform || '').toString().toLowerCase();

  if (!caption) return res.status(400).json({ error: 'Field "caption" wajib diisi.' });
  if (!PLATFORMS[platform]) {
    return res.status(400).json({
      error: `Platform tidak dikenal. Pilihan: ${Object.keys(PLATFORMS).join(', ')}.`
    });
  }

  // Simulate API latency (300-1100ms) so loading states are visible in the UI.
  await sleep(300 + Math.floor(Math.random() * 800));

  if (DEMO_MODE) {
    const result = simulatePost(platform, caption);
    return res.status(200).json({ ...result, mode: 'demo' });
  }

  // Real mode would dispatch to the proper API here. Keep this as a guarded
  // path so the demo never accidentally calls a live endpoint.
  return res.status(501).json({
    platform,
    success: false,
    error: 'Real-mode publishing belum dikonfigurasi. Set credentials di env vars + DEMO_MODE=false.',
    mode: 'real-disabled'
  });
};
