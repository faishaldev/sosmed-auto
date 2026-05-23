// Template caption engine — deterministic, no AI required.
// Used by /api/generate and /api/webhook (server-side).
// The client (index.html) ships its own copy for offline/instant generation.

const TEMPLATE_KEYS = ['promo', 'tips', 'tutorial', 'testimoni', 'behindscene'];

function generateCaption(topic, template) {
  const safeTopic = String(topic || '').trim();
  if (!safeTopic) throw new Error('topic is required');

  const clean = safeTopic.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const upper = safeTopic.toUpperCase();
  const key = TEMPLATE_KEYS.includes(template) ? template : 'promo';

  const builders = {
    promo: () =>
`🔥 PROMO SPESIAL! 🔥

${safeTopic} hadir dengan penawaran terbaik buat kamu!

✨ Kualitas premium
✨ Harga bersahabat
✨ Stok terbatas

Yuk order sekarang sebelum kehabisan! Link di bio 👆

#promo #${clean} #flashsale #shopnow`,

    tips: () =>
`💡 TIPS HARI INI 💡

Mau tahu cara terbaik soal ${safeTopic}?

Simpan post ini & coba terapkan ya:
1. Mulai dari hal kecil
2. Konsisten setiap hari
3. Evaluasi hasilnya tiap minggu

Tag temanmu yang butuh tips ini! 🙌

#tips #${clean} #edukasi #foryou`,

    tutorial: () =>
`🎬 TUTORIAL: ${upper}

Step by step bisa kamu ikutin di video ini ⬆️

✅ Mudah diikuti
✅ Tanpa alat ribet
✅ Hasilnya kelihatan

Jangan lupa follow buat tutorial lainnya ya!

#tutorial #howto #${clean} #belajar`,

    testimoni: () =>
`⭐ TESTIMONI PELANGGAN ⭐

"${safeTopic}" — kata salah satu pelanggan setia kami 😍

Terima kasih sudah percaya, kami akan terus jaga kualitas!

Mau jadi pelanggan berikutnya? DM sekarang 📩

#testimoni #review #happycustomer`,

    behindscene: () =>
`🎥 BEHIND THE SCENE 🎥

Beginilah proses di balik ${safeTopic} yang biasa kamu lihat.

Setiap detail kami perhatikan biar hasilnya maksimal 💪

Ada pertanyaan? Drop di komentar ya!

#bts #behindthescene #process #${clean}`
  };

  return builders[key]();
}

module.exports = { generateCaption, TEMPLATE_KEYS };
