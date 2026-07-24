# Product tour voiceover

## Voice

| Field | Value |
| --- | --- |
| Provider | ElevenLabs |
| Voice name | Daniel — Steady Broadcaster |
| Voice ID | `onwK4e9ZLuTAKqWW03F9` |
| Model | `eleven_multilingual_v2` |
| Style | Clear, premium, calm English SaaS demo |

## Script

Source of truth: `scripts/voiceover-script.txt` (must stay ≤ 10,000 characters).

## Generation

```bash
export ELEVENLABS_API_KEY=...   # never commit
node scripts/generate-voiceover.mjs
node scripts/mux-voiceover.mjs
```

Outputs:

- `public/videos/voiceover/zivvy-product-tour-vo.mp3` (gitignored)
- `public/videos/zivvy-product-tour.{mp4,webm}`
- `public/videos/zivvy-product-tour-poster.jpg`

## Recording

```bash
# Ensure demo.business can log in (401 = re-seed with env forwarded — see record-product-tour.mjs header)
node scripts/record-product-tour.mjs
node scripts/generate-voiceover.mjs
node scripts/mux-voiceover.mjs
```

The recorder **hard-fails** unless `/api/method/login` returns HTTP 200 and the Next.js dashboard shell is visible. Do not ship a cut that only shows a failed sign-in.
