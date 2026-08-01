/**
 * Mux silent walkthrough video with ElevenLabs voiceover.
 * Pads/trims audio to video duration; writes final mp4/webm + poster.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "public", "videos", "raw", "business-walkthrough-raw.webm");
const VO = path.join(ROOT, "public", "videos", "voiceover", "zivvy-product-tour-vo.mp3");
const OUT_MP4 = path.join(ROOT, "public", "videos", "zivvy-product-tour.mp4");
const OUT_WEBM = path.join(ROOT, "public", "videos", "zivvy-product-tour.webm");
const OUT_POSTER = path.join(ROOT, "public", "videos", "zivvy-product-tour-poster.jpg");

function run(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(res.stdout);
    console.error(res.stderr);
    throw new Error(`${cmd} failed with ${res.status}`);
  }
  return res;
}

function probeDuration(file) {
  const res = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    file
  ]);
  return parseFloat(String(res.stdout).trim());
}

function main() {
  if (!fs.existsSync(RAW)) throw new Error(`Missing raw video: ${RAW}`);
  if (!fs.existsSync(VO)) throw new Error(`Missing voiceover: ${VO}`);

  const vDur = probeDuration(RAW);
  const aDur = probeDuration(VO);
  console.log({ vDur, aDur });

  // Scale video to 1280x720, add voiceover; if audio longer, extend last frame; if shorter, pad silence.
  const filter =
    aDur > vDur
      ? `[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,tpad=stop_mode=clone:stop_duration=${(
          aDur - vDur
        ).toFixed(3)}[v]`
      : `[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v]`;

  const audioFilter =
    aDur >= vDur
      ? "[1:a]aformat=sample_rates=44100:channel_layouts=stereo[a]"
      : `[1:a]apad=whole_dur=${vDur.toFixed(3)},aformat=sample_rates=44100:channel_layouts=stereo[a]`;

  run("ffmpeg", [
    "-y",
    "-i",
    RAW,
    "-i",
    VO,
    "-filter_complex",
    `${filter};${audioFilter}`,
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-shortest",
    "-movflags",
    "+faststart",
    OUT_MP4
  ]);

  run("ffmpeg", [
    "-y",
    "-i",
    OUT_MP4,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "0",
    "-crf",
    "32",
    "-row-mt",
    "1",
    "-c:a",
    "libopus",
    "-b:a",
    "128k",
    OUT_WEBM
  ]);

  // Prefer a post-login dashboard frame (login + redirect usually finish by ~8–10s)
  run("ffmpeg", ["-y", "-ss", "00:00:10", "-i", OUT_MP4, "-vframes", "1", "-q:v", "2", OUT_POSTER]);

  console.log("Wrote", OUT_MP4);
  console.log("Wrote", OUT_WEBM);
  console.log("Wrote", OUT_POSTER);
  console.log("Final duration:", probeDuration(OUT_MP4));
}

main();
