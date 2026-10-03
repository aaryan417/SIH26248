# SIH26248 — Immersive Multi-Domain Decision-Making Trainer

Frontend prototype for Smart India Hackathon 2026 Problem Statement **SIH26248**, proposed by the Ministry of Defence (MoD), Defence Services Staff College.

## Local 360° Media Setup

For local 360° VR video development, place an equirectangular MP4 video at:

```text
public/videos/training360.mp4
```

Alternatively, configure an external object storage / CDN URL in `.env`:

```env
VITE_DEFAULT_360_VIDEO_URL=https://cdn.example.com/training360.mp4
```

## Running Locally

```bash
npm install
npm run dev
```

App will run at `http://localhost:3000`.

## Testing & Verification

```bash
npm test
npm run lint
npm run build
```
