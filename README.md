# SosMed Auto — Demo Prototype

Sistem **Otomatis Generate &amp; Posting Konten Social Media** ke TikTok, Instagram Reels, dan Facebook Page.

Stack:
- **Frontend**: Single-page dashboard (HTML + Tailwind CDN + Vanilla JS) — no build step.
- **Backend**: Vercel serverless functions (`/api/*`) — Node.js, no dependencies.
- **State**: `localStorage` di sisi client (zero infra, persisten across sesi).
- **Scheduler**: Client-side interval (cek antrian tiap 15 detik selama tab terbuka).
- **Alternatif backend**: n8n workflow (`workflow.n8n.json`) — bisa import ke n8n cloud / self-hosted.

---

## Struktur

```
sosmed-auto-demo/
├── index.html              # Dashboard (UI utama)
├── api/
│   ├── generate.js         # POST /api/generate   — caption dari topik + template
│   ├── post.js             # POST /api/post       — simulasi posting per platform
│   ├── webhook.js          # POST /api/webhook    — intake eksternal (n8n compatible)
│   ├── health.js           # GET  /api/health     — status & daftar endpoint
│   └── _cors.js            # Helper CORS + body parser
├── lib/
│   └── templates.js        # Template caption engine (5 template siap pakai)
├── workflow.n8n.json       # n8n workflow lengkap (opsional, untuk import ke n8n)
├── package.json
├── vercel.json
└── README.md
```

---

## Deploy ke Vercel (3 menit)

### Opsi A — via Vercel CLI

```bash
npm i -g vercel
cd sosmed-auto-demo
vercel              # follow prompt: link/buat project baru
vercel --prod       # deploy production
```

### Opsi B — via GitHub + Vercel Dashboard

1. Push folder ini ke GitHub (`git init && git add . && git commit -m init && git push`).
2. Buka [vercel.com/new](https://vercel.com/new) → Import repository.
3. Framework Preset: **Other** (auto-detect static + serverless functions).
4. Klik **Deploy**. Selesai.

### Opsi C — Drag &amp; Drop

Buka [vercel.com/new](https://vercel.com/new) → drag folder `sosmed-auto-demo` ke browser → Deploy.

> Setelah deploy, dashboard hidup di root URL (mis. `https://sosmed-auto-demo.vercel.app`) dan API di `/api/health`, `/api/generate`, dst.

### Jalanin lokal

```bash
npm i -g vercel
vercel dev    # serve di http://localhost:3000 lengkap dengan /api/*
```

Atau buka `index.html` langsung di browser — dashboard tetap jalan dengan template engine lokal (API offline → otomatis fallback).

---

## Fitur yang Sudah Berfungsi End-to-End

| Fitur | Implementasi |
|-------|--------------|
| Generate caption | `POST /api/generate` (server) + fallback client-side `clientTemplates` |
| 5 template siap pakai | Promo / Tips / Tutorial / Testimoni / Behind The Scene |
| Pilih multi-platform | Chip toggle (TikTok / IG / FB) |
| Schedule posting | `datetime-local` input + scheduler interval 15 detik |
| Eksekusi posting | `POST /api/post` per platform, paralel, dengan loading state |
| Status per platform | Setiap platform tracked: success ✓ / fail ✗ |
| Status agregat | `scheduled` → `posting` → `posted` / `partial` / `failed` |
| Retry / Post-Now | Tombol "Post Sekarang" di setiap row |
| Hapus dari antrian | Tombol "Hapus" |
| Activity feed real | Update otomatis tiap aksi |
| Stats dinamis | Total / Posted / Pending / Generated — live dari state |
| Persistence | `localStorage` — refresh browser tidak hilang |
| Toast notifications | Success / Warn / Error / Info |
| Health probe | Sidebar nunjukin API online/offline + mode (demo/real) |
| Webhook intake | `POST /api/webhook` — kompatibel dengan node n8n |

---

## API Reference

### `GET /api/health`
Status &amp; daftar endpoint.

### `POST /api/generate`
```json
{ "topic": "Promo kopi susu", "template": "promo" }
```
Template valid: `promo`, `tips`, `tutorial`, `testimoni`, `behindscene`.

Response:
```json
{ "ok": true, "topic": "...", "template": "promo", "caption": "🔥 PROMO...", "generatedAt": "..." }
```

### `POST /api/post`
```json
{ "caption": "...", "platform": "tiktok" }
```
Platform valid: `tiktok`, `instagram`, `facebook`.

Response (demo mode):
```json
{ "platform": "tiktok", "success": true, "postId": "tiktok_...", "url": "https://...", "postedAt": "...", "mode": "demo" }
```

### `POST /api/webhook`
Drop-in pengganti webhook n8n. Payload sama dengan dashboard:
```json
{
  "topic": "...",
  "template": "promo",
  "platforms": ["tiktok","instagram"],
  "schedule": "2026-05-23T19:00:00Z",
  "videoUrl": "https://..."
}
```

---

## Demo Mode vs Real Mode

Default semua deploy = **demo mode**. `/api/post` mensimulasikan respons platform dengan latency realistis (~95% success rate) supaya flow end-to-end bisa didemokan **tanpa** credential apapun.

Untuk **real mode**, set env var di Vercel project settings:

```
DEMO_MODE=false
TIKTOK_ACCESS_TOKEN=...
META_ACCESS_TOKEN=...
META_IG_USER_ID=...
META_FB_PAGE_ID=...
```

Lalu lengkapi cabang `if (DEMO_MODE)` di [api/post.js](api/post.js#L60) dengan call ke TikTok Content Posting API + Meta Graph API. Hook-nya sudah ada, tinggal isi.

---

## Cara Demo ke Klien (2 menit)

1. **Buka link Vercel** → klien lihat dashboard live.
2. Klik **Generate Caption** → caption muncul dari `/api/generate` (cek Network tab kalau mau bukti).
3. Pilih platform, set jadwal **30 detik dari sekarang**, klik **Kirim ke Antrian**.
4. Tunggu — scheduler otomatis post: status berubah `scheduled → posting → posted`, activity feed update.
5. Buka `https://<deploy>.vercel.app/api/health` → lihat backend hidup.
6. Tunjukin `workflow.n8n.json` — "Kalau klien lebih suba pakai n8n self-hosted, file ini tinggal di-import."

---

## Roadmap (kalau dilanjut)

- [ ] Auth + multi-tenant (Supabase / Clerk)
- [ ] Database (Vercel KV / Postgres / Supabase) untuk shared queue antar device
- [ ] Upload video langsung dari dashboard ke S3 / Cloudinary
- [ ] AI caption generator (toggle: template vs OpenAI/Claude/Gemini)
- [ ] Analytics: jumlah view per platform via API masing-masing
- [ ] Notifikasi WhatsApp / Telegram saat post sukses/gagal
- [ ] Vercel Cron untuk scheduler server-side (tidak perlu tab terbuka)
- [ ] OAuth flow per platform (TikTok Login Kit, Meta Login)

---

## Talking Points (untuk balasan klien)

**Q: Sudah pernah buat workflow di n8n?**
> Iya, saya attach `workflow.n8n.json` — flow: webhook intake → caption generator (Code node, template engine, gratis) → Switch schedule-vs-now → Wait sampai jadwal → SplitOut per platform → publish ke TikTok Content Posting API, Meta Graph API untuk IG Reels &amp; FB Page.

**Q: Sudah pernah project sejenis?**
> Demo ini saya bangun khusus untuk preview project Bapak/Ibu — sudah live di Vercel, semua fitur jalan end-to-end. Link demo akan saya share. Stack-nya sengaja ringan: tidak ada framework berat, tidak ada DB kompleks, low maintenance.

**Q: Apa keunggulan pendekatan ini?**
- **Low maintenance**: zero dependency runtime, caption pakai template engine deterministic. Bisa upgrade ke AI cukup ganti 1 file.
- **Hosting murah / gratis**: dashboard + API jalan di Vercel free tier. Atau pakai n8n self-hosted di VPS 50rb/bulan.
- **Scalable**: tambah platform = tambah 1 file di `/api/`. Tambah template = edit 1 file `lib/templates.js`.
- **Visual**: klien bisa lihat workflow di n8n (drag &amp; drop, tanpa coding) atau langsung pakai dashboard.

---

## Lisensi

MIT — bebas dipakai, dimodifikasi, dideploy ulang.
