import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS    = path.join(__dirname, "../../assets");

// ── Helpers ──────────────────────────────────────────────────────────────────

async function loadImageFromUrl(url: string) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 6000 });
  return loadImage(Buffer.from(res.data));
}

async function loadBg(filename: string) {
  try {
    return await loadImage(path.join(ASSETS, filename));
  } catch {
    return null;
  }
}

function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCircleAvatar(ctx: any, img: any, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

function borderLine(ctx: any, y: number, W: number, color: string) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,   `${color}00`);
  g.addColorStop(0.5, color);
  g.addColorStop(1,   `${color}00`);
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, 2);
}

// ── Welcome Card ──────────────────────────────────────────────────────────────
// Background: banner3 (pink dreamy sky with moon & saturn)

export async function createWelcomeCard(
  avatarUrl: string,
  username:  string,
  serverName: string,
  memberCount: number
): Promise<Buffer> {
  const W = 960, H = 320;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Background image
  const bg = await loadBg("welcome-bg.jpg");
  if (bg) {
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    const fb = ctx.createLinearGradient(0, 0, W, H);
    fb.addColorStop(0, "#2d0845"); fb.addColorStop(1, "#a61c5e");
    ctx.fillStyle = fb; ctx.fillRect(0, 0, W, H);
  }

  // Dark overlay so text is legible
  const overlay = ctx.createLinearGradient(0, 0, W, 0);
  overlay.addColorStop(0,    "rgba(10,5,30,0.2)");
  overlay.addColorStop(0.32, "rgba(10,5,30,0.52)");
  overlay.addColorStop(0.5,  "rgba(10,5,30,0.65)");
  overlay.addColorStop(1,    "rgba(10,5,30,0.72)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Subtle vertical divider between avatar zone and text zone
  const divG = ctx.createLinearGradient(0, 0, 0, H);
  divG.addColorStop(0,   "rgba(255,255,255,0)");
  divG.addColorStop(0.3, "rgba(255,200,230,0.45)");
  divG.addColorStop(0.7, "rgba(255,200,230,0.45)");
  divG.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = divG;
  ctx.fillRect(316, 0, 2, H);

  // ── Avatar ──
  const cx = 160, cy = H / 2, R = 84;
  try {
    const avatar = await loadImageFromUrl(avatarUrl + "?size=256");

    // Outer glow
    const aura = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R + 30);
    aura.addColorStop(0,   "rgba(255,190,220,0.45)");
    aura.addColorStop(1,   "rgba(255,190,220,0)");
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(cx, cy, R + 30, 0, Math.PI * 2); ctx.fill();

    // White ring
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();

    drawCircleAvatar(ctx, avatar, cx, cy, R);
  } catch { /* skip avatar on failure */ }

  // ── Text side ──
  const tx = 343;
  ctx.textAlign    = "left";
  ctx.textBaseline = "top";

  // "WELCOME" heading with pink glow
  ctx.save();
  ctx.shadowColor = "rgba(255,100,180,0.9)"; ctx.shadowBlur = 18;
  const wg = ctx.createLinearGradient(tx, 0, tx + 400, 0);
  wg.addColorStop(0, "#ff9de2"); wg.addColorStop(1, "#ffffff");
  ctx.fillStyle = wg;
  ctx.font      = "bold 46px sans-serif";
  ctx.fillText("✿ WELCOME ✿", tx, 52);
  ctx.restore();

  // Username
  ctx.fillStyle    = "#ffffff";
  ctx.font         = "bold 30px sans-serif";
  const uname      = username.length > 20 ? username.slice(0, 19) + "…" : username;
  ctx.fillText(uname, tx, 112);

  // Thin separator
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(tx, 155, 330, 1.5);

  // Server join line
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font      = "18px sans-serif";
  const sn = serverName.length > 28 ? serverName.slice(0, 27) + "…" : serverName;
  ctx.fillText(`Joined  ${sn}  ♡`, tx, 168);

  // Member count pill
  ctx.save();
  roundRect(ctx, tx, 200, 215, 36, 18);
  ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fill();
  roundRect(ctx, tx, 200, 215, 36, 18);
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  ctx.fillStyle    = "#ffffff";
  ctx.font         = "bold 15px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`✦  Member #${memberCount}`, tx + 16, 218);

  // Hint
  ctx.fillStyle    = "rgba(255,255,255,0.38)";
  ctx.font         = "13px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Use /help to see all commands~ (◕ᴗ◕✿)", tx, 270);

  return canvas.toBuffer("image/png");
}

// ── Help Banner ───────────────────────────────────────────────────────────────
// Background: help-bg.png (lavender purple, full moon rising through clouds)

export async function createHelpBanner(): Promise<Buffer> {
  const W = 700, H = 200;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Background image
  const bg = await loadBg("help-bg.png");
  if (bg) {
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    const fb = ctx.createLinearGradient(0, 0, W, H);
    fb.addColorStop(0, "#3d1178"); fb.addColorStop(1, "#060118");
    ctx.fillStyle = fb; ctx.fillRect(0, 0, W, H);
  }

  // Dark overlay for text legibility
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0,   "rgba(8,2,25,0.55)");
  overlay.addColorStop(0.5, "rgba(8,2,25,0.42)");
  overlay.addColorStop(1,   "rgba(8,2,25,0.58)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Border lines
  borderLine(ctx, 0,     W, "#ff79c6");
  borderLine(ctx, H - 2, W, "#bd93f9");

  // Title with glow
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.save();
  ctx.shadowColor = "rgba(255,105,180,0.9)"; ctx.shadowBlur = 24;
  const tg = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  tg.addColorStop(0, "#ff79c6"); tg.addColorStop(0.5, "#fffce0"); tg.addColorStop(1, "#bd93f9");
  ctx.fillStyle = tg;
  ctx.font      = "bold 54px sans-serif";
  ctx.fillText("✿ Kawaii Bot ✿", W / 2, H / 2 - 26);
  ctx.restore();

  // Subtitle
  ctx.save();
  ctx.shadowColor = "rgba(255,100,180,0.55)"; ctx.shadowBlur = 10;
  ctx.fillStyle   = "rgba(255,185,225,0.92)";
  ctx.font        = "17px sans-serif";
  ctx.fillText("♡ Your cute economy, anime & fun companion~ ♡", W / 2, H / 2 + 20);
  ctx.restore();

  // Tag line
  ctx.fillStyle = "rgba(210,180,255,0.72)";
  ctx.font      = "13px sans-serif";
  ctx.fillText("✦ Slash Commands Ready  •  Type /help anytime  •  27 commands~ ✦", W / 2, H / 2 + 50);

  return canvas.toBuffer("image/png");
}

// ── Help Thumbnail (small 256×256 icon card — keeps gradient bg) ─────────────

export async function createHelpThumbnail(): Promise<Buffer> {
  const S = 256;
  const canvas = createCanvas(S, S);
  const ctx    = canvas.getContext("2d") as any;

  // Radial purple background
  const bg = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.7);
  bg.addColorStop(0,   "#6b21a8");
  bg.addColorStop(0.6, "#3b0764");
  bg.addColorStop(1,   "#0f0020");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // Gradient border ring
  const borderG = ctx.createLinearGradient(0, 0, S, S);
  borderG.addColorStop(0,   "#ff79c6");
  borderG.addColorStop(0.5, "#bd93f9");
  borderG.addColorStop(1,   "#ff79c6");
  ctx.strokeStyle = borderG;
  ctx.lineWidth   = 5;
  ctx.strokeRect(4, 4, S - 8, S - 8);

  // Large ✿ icon
  ctx.save();
  ctx.shadowColor = "rgba(255,121,198,0.9)"; ctx.shadowBlur = 28;
  const ig = ctx.createLinearGradient(S / 2 - 60, 0, S / 2 + 60, 0);
  ig.addColorStop(0, "#ff79c6"); ig.addColorStop(0.5, "#fffce0"); ig.addColorStop(1, "#bd93f9");
  ctx.fillStyle    = ig;
  ctx.font         = "bold 120px sans-serif";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✿", S / 2, S / 2 - 10);
  ctx.restore();

  // Label
  ctx.fillStyle    = "rgba(255,255,255,0.6)";
  ctx.font         = "bold 16px sans-serif";
  ctx.textAlign    = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("KAWAII BOT", S / 2, S - 18);

  return canvas.toBuffer("image/png");
}

// ── Leaderboard Banner ────────────────────────────────────────────────────────
// Background: leaderboard-bg.jpg (purple night sky with crescent moon)

export async function createLeaderboardBanner(type: string): Promise<Buffer> {
  const W = 700, H = 180;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Background image
  const bg = await loadBg("leaderboard-bg.jpg");
  if (bg) {
    ctx.drawImage(bg, 0, 0, W, H);
  } else {
    const fb = ctx.createLinearGradient(0, 0, W, H);
    fb.addColorStop(0, "#060118"); fb.addColorStop(1, "#1a0545");
    ctx.fillStyle = fb; ctx.fillRect(0, 0, W, H);
  }

  // Dark overlay
  const overlay = ctx.createLinearGradient(0, 0, 0, H);
  overlay.addColorStop(0,   "rgba(6,1,24,0.58)");
  overlay.addColorStop(0.5, "rgba(6,1,24,0.45)");
  overlay.addColorStop(1,   "rgba(6,1,24,0.62)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, W, H);

  // Type-specific accent tint
  const tints: Record<string, string> = {
    xp:     "rgba(100,200,255,0.08)",
    streak: "rgba(255,120,60,0.08)",
    wealth: "rgba(255,215,0,0.08)",
  };
  ctx.fillStyle = tints[type] ?? "rgba(189,147,249,0.06)";
  ctx.fillRect(0, 0, W, H);

  // Type-specific accent border colors
  const borderColors: Record<string, [string, string]> = {
    xp:     ["#5bc8ff", "#bd93f9"],
    streak: ["#ff7c3a", "#ffb347"],
    wealth: ["#ffd700", "#fffaaa"],
  };
  const [topC, botC] = borderColors[type] ?? ["#ff79c6", "#bd93f9"];
  borderLine(ctx, 0,     W, topC);
  borderLine(ctx, H - 2, W, botC);

  // Icon + type label
  const icons: Record<string, string>  = { xp: "⭐", streak: "🔥", wealth: "🪙" };
  const labels: Record<string, string> = { xp: "XP Leaderboard", streak: "Streak Leaderboard", wealth: "Wealth Leaderboard" };
  const icon  = icons[type]  ?? "🏆";
  const label = labels[type] ?? "Leaderboard";

  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  // Title glow
  ctx.save();
  ctx.shadowColor = "rgba(255,200,255,0.8)"; ctx.shadowBlur = 22;
  const tg = ctx.createLinearGradient(W / 2 - 180, 0, W / 2 + 180, 0);
  tg.addColorStop(0, topC); tg.addColorStop(0.5, "#ffffff"); tg.addColorStop(1, botC);
  ctx.fillStyle = tg;
  ctx.font      = "bold 48px sans-serif";
  ctx.fillText(`${icon} ${label} ${icon}`, W / 2, H / 2 - 22);
  ctx.restore();

  // Subtitle
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font      = "16px sans-serif";
  ctx.fillText("✦ Kawaii Bot  •  Top Players This Season ✦", W / 2, H / 2 + 18);

  // Bottom hint
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font      = "13px sans-serif";
  ctx.fillText("Use /leaderboard xp | streak | wealth  ♡", W / 2, H / 2 + 46);

  return canvas.toBuffer("image/png");
}
