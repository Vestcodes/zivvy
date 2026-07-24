/**
 * Generate ElevenLabs TTS for the product tour voiceover.
 * Voice: Daniel — Steady Broadcaster (onwK4e9ZLuTAKqWW03F9)
 * Clear, premium, calm English SaaS-demo narration.
 *
 * Requires: ELEVENLABS_API_KEY in env (never commit the key).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCRIPT_PATH = path.join(__dirname, "voiceover-script.txt");
const OUT_DIR = path.join(ROOT, "public", "videos", "voiceover");
const OUT_FILE = path.join(OUT_DIR, "zivvy-product-tour-vo.mp3");

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "onwK4e9ZLuTAKqWW03F9";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";

async function main() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required");

  const text = fs.readFileSync(SCRIPT_PATH, "utf8").trim();
  if (!text) throw new Error("Empty voiceover script");
  if (text.length > 10000) {
    throw new Error(`Script is ${text.length} chars; must be ≤ 10000`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log("Voice ID:", VOICE_ID);
  console.log("Chars:", text.length);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg"
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.75,
        style: 0.15,
        use_speaker_boost: true
      }
    })
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${body}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(OUT_FILE, buf);
  console.log("Wrote", OUT_FILE, buf.length, "bytes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
