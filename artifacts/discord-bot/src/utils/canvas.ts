import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function loadImageFromUrl(url: string) {
  const res = await axios.get(url, { responseType: "arraybuffer", timeout: 6000 });
  return loadImage(Buffer.from(res.data));
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

function glyph(
  ctx: any, text: string, x: number, y: number,
  size: number, color: string, alpha: number
) {
  ctx.save();
  ctx.globalAlpha    = alpha;
  ctx.fillStyle      = color;
  ctx.font           = `${size}px sans-serif`;
  ctx.textAlign      = "center";
  ctx.textBaseline   = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Welcome Card ─────────────────────────────────────────────────────────────

export async function createWelcomeCard(
  avatarUrl: string,
  username: string,
  serverName: string,
  memberCount: number
): Promise<Buffer> {
  const W = 960, H = 320;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // ── Layer 1: Base vibrant rose-purple gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,    "#1e0535");
  bg.addColorStop(0.28, "#5c1282");
  bg.addColorStop(0.6,  "#a61c5e");
  bg.addColorStop(1,    "#1e0535");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Layer 2: Diagonal pastel shimmer ──
  const shimmer = ctx.createLinearGradient(0, 0, W * 0.75, H);
  shimmer.addColorStop(0,   "rgba(255,182,217,0.18)");
  shimmer.addColorStop(0.5, "rgba(255,182,217,0.05)");
  shimmer.addColorStop(1,   "rgba(189,147,249,0.12)");
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, W, H);

  // ── Layer 3: Mint/teal accent at bottom ──
  const mint = ctx.createLinearGradient(0, H * 0.55, 0, H);
  mint.addColorStop(0, "rgba(163,241,212,0)");
  mint.addColorStop(1, "rgba(163,241,212,0.07)");
  ctx.fillStyle = mint;
  ctx.fillRect(0, 0, W, H);

  // ── Layer 4: Avatar area radial glow (pink) ──
  const aGlow = ctx.createRadialGradient(165, H / 2, 0, 165, H / 2, 185);
  aGlow.addColorStop(0,   "rgba(255,120,195,0.38)");
  aGlow.addColorStop(0.5, "rgba(255,120,195,0.14)");
  aGlow.addColorStop(1,   "rgba(255,120,195,0)");
  ctx.fillStyle = aGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Layer 5: Text area radial glow (lavender) ──
  const tGlow = ctx.createRadialGradient(700, 160, 0, 700, 160, 230);
  tGlow.addColorStop(0, "rgba(189,147,249,0.18)");
  tGlow.addColorStop(1, "rgba(189,147,249,0)");
  ctx.fillStyle = tGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Sakura flowers ──
  const flowers = [
    { x: 50,  y: 28,  s: 19, c: "#ffb3de", a: 0.52 },
    { x: 905, y: 26,  s: 17, c: "#ffb3de", a: 0.48 },
    { x: 28,  y: 282, s: 15, c: "#b2f7ef", a: 0.42 },
    { x: 928, y: 288, s: 16, c: "#b2f7ef", a: 0.42 },
    { x: 485, y: 18,  s: 13, c: "#ffb3de", a: 0.36 },
    { x: 562, y: 304, s: 14, c: "#c9b1ff", a: 0.4  },
    { x: 725, y: 28,  s: 12, c: "#ffb3de", a: 0.36 },
    { x: 382, y: 308, s: 13, c: "#b2f7ef", a: 0.36 },
    { x: 825, y: 298, s: 12, c: "#c9b1ff", a: 0.32 },
    { x: 268, y: 20,  s: 11, c: "#ffb3de", a: 0.3  },
    { x: 840, y: 28,  s: 10, c: "#b2f7ef", a: 0.28 },
    { x: 640, y: 308, s: 11, c: "#ffb3de", a: 0.3  },
  ];
  for (const f of flowers) glyph(ctx, "✿", f.x, f.y, f.s, f.c, f.a);

  // ── Stars ──
  const stars = [
    { x: 98,  y: 55,  s: 12, c: "#ffd700", a: 0.58 },
    { x: 835, y: 62,  s: 14, c: "#ffd700", a: 0.52 },
    { x: 512, y: 303, s: 11, c: "#ffd700", a: 0.42 },
    { x: 672, y: 36,  s: 13, c: "#ffe0f0", a: 0.48 },
    { x: 72,  y: 212, s: 10, c: "#ffd700", a: 0.42 },
    { x: 885, y: 222, s: 11, c: "#ffd700", a: 0.42 },
    { x: 422, y: 14,  s: 10, c: "#ffd700", a: 0.36 },
    { x: 762, y: 282, s: 11, c: "#ffe0f0", a: 0.36 },
    { x: 200, y: 308, s: 9,  c: "#ffd700", a: 0.3  },
    { x: 900, y: 148, s: 9,  c: "#c9b1ff", a: 0.35 },
  ];
  for (const s of stars) glyph(ctx, "✦", s.x, s.y, s.s, s.c, s.a);

  // ── Hearts ──
  const hearts = [
    { x: 868, y: 142, s: 15, c: "#ff79c6", a: 0.42 },
    { x: 58,  y: 158, s: 13, c: "#ff79c6", a: 0.36 },
    { x: 332, y: 293, s: 12, c: "#ff79c6", a: 0.36 },
    { x: 642, y: 308, s: 11, c: "#c9b1ff", a: 0.32 },
    { x: 740, y: 298, s: 10, c: "#ff79c6", a: 0.28 },
  ];
  for (const h of hearts) glyph(ctx, "♡", h.x, h.y, h.s, h.c, h.a);

  // ── Outer gradient border ──
  ctx.save();
  roundRect(ctx, 5, 5, W - 10, H - 10, 22);
  const border = ctx.createLinearGradient(0, 0, W, H);
  border.addColorStop(0,   "rgba(255,121,198,0.65)");
  border.addColorStop(0.5, "rgba(189,147,249,0.55)");
  border.addColorStop(1,   "rgba(255,121,198,0.65)");
  ctx.strokeStyle = border;
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.restore();

  // ── Inner card panel ──
  ctx.save();
  roundRect(ctx, 17, 17, W - 34, H - 34, 16);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fill();
  ctx.restore();

  // ── Divider line (pink → lavender gradient) ──
  const div = ctx.createLinearGradient(312, 0, 314, H);
  div.addColorStop(0,   "rgba(255,121,198,0)");
  div.addColorStop(0.3, "rgba(255,121,198,0.65)");
  div.addColorStop(0.5, "rgba(255,121,198,0.75)");
  div.addColorStop(0.7, "rgba(189,147,249,0.65)");
  div.addColorStop(1,   "rgba(189,147,249,0)");
  ctx.fillStyle = div;
  ctx.fillRect(312, 32, 2, H - 64);

  // ── Avatar ──
  try {
    const avatar = await loadImageFromUrl(avatarUrl + "?size=256");
    const cx = 162, cy = H / 2, R = 85;

    // Soft aura
    const aura = ctx.createRadialGradient(cx, cy, R - 10, cx, cy, R + 32);
    aura.addColorStop(0,   "rgba(255,120,195,0.42)");
    aura.addColorStop(0.5, "rgba(189,147,249,0.2)");
    aura.addColorStop(1,   "rgba(255,120,195,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 32, 0, Math.PI * 2);
    ctx.fill();

    // Outer rainbow ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R + 7, 0, Math.PI * 2);
    const ring = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    ring.addColorStop(0,   "#c9b1ff");
    ring.addColorStop(0.33, "#ff79c6");
    ring.addColorStop(0.66, "#b2f7ef");
    ring.addColorStop(1,   "#ffd700");
    ctx.strokeStyle = ring;
    ctx.lineWidth   = 3.5;
    ctx.stroke();
    ctx.restore();

    // Inner white ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R + 2, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();

    // Avatar
    drawCircleAvatar(ctx, avatar, cx, cy, R - 1);

    // Sparkle dots around avatar
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];
    for (const deg of angles) {
      const rad = (deg * Math.PI) / 180;
      const sx  = cx + Math.cos(rad) * (R + 17);
      const sy  = cy + Math.sin(rad) * (R + 17);
      const col = deg % 90 === 0 ? "#ffd700" : "#ff79c6";
      glyph(ctx, "·", sx, sy, 14, col, 0.75);
    }
  } catch { /* skip avatar on error */ }

  // ── Text area ──
  const tx = 343;
  ctx.textAlign = "left";

  // WELCOME gradient text
  const wGrad = ctx.createLinearGradient(tx, 0, tx + 400, 0);
  wGrad.addColorStop(0,   "#ff79c6");
  wGrad.addColorStop(0.5, "#fffce0");
  wGrad.addColorStop(1,   "#bd93f9");
  ctx.fillStyle    = wGrad;
  ctx.font         = "bold 46px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("✿ WELCOME ✿", tx, 54);

  // Username
  ctx.fillStyle = "#ffffff";
  ctx.font      = "bold 30px sans-serif";
  const dname = username.length > 20 ? username.slice(0, 19) + "…" : username;
  ctx.fillText(dname, tx, 112);

  // Accent line
  const acc = ctx.createLinearGradient(tx, 0, tx + 330, 0);
  acc.addColorStop(0,   "#ff79c6");
  acc.addColorStop(0.55, "#bd93f9");
  acc.addColorStop(1,   "rgba(189,147,249,0)");
  ctx.fillStyle = acc;
  ctx.fillRect(tx, 155, 330, 2);

  // Server name
  ctx.fillStyle    = "rgba(255,255,255,0.72)";
  ctx.font         = "18px sans-serif";
  const sname = serverName.length > 30 ? serverName.slice(0, 29) + "…" : serverName;
  ctx.fillText(`You joined ${sname}~!! ♡`, tx, 170);

  // Member count pill
  ctx.save();
  roundRect(ctx, tx, 200, 218, 37, 18);
  const pill = ctx.createLinearGradient(tx, 0, tx + 218, 0);
  pill.addColorStop(0, "rgba(255,121,198,0.28)");
  pill.addColorStop(1, "rgba(189,147,249,0.28)");
  ctx.fillStyle = pill;
  ctx.fill();
  roundRect(ctx, tx, 200, 218, 37, 18);
  ctx.strokeStyle = "rgba(255,121,198,0.55)";
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle    = "#ffb3de";
  ctx.font         = "bold 16px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`✦ Member #${memberCount}`, tx + 18, 219);

  // Sub text
  ctx.fillStyle    = "rgba(255,255,255,0.4)";
  ctx.font         = "13px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Use /help to see all I can do~ (◕ᴗ◕✿)", tx, 275);

  return canvas.toBuffer("image/png");
}

// ── Help Banner ──────────────────────────────────────────────────────────────

export async function createHelpBanner(): Promise<Buffer> {
  const W = 700, H = 195;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#1a0535");
  bg.addColorStop(0.4, "#5c1282");
  bg.addColorStop(0.6, "#a61c5e");
  bg.addColorStop(1,   "#1a0535");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Diagonal shimmer
  const shimmer = ctx.createLinearGradient(0, 0, W, H);
  shimmer.addColorStop(0,   "rgba(255,182,217,0)");
  shimmer.addColorStop(0.4, "rgba(255,182,217,0.15)");
  shimmer.addColorStop(1,   "rgba(189,147,249,0.1)");
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, W, H);

  // Center glow
  const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 230);
  cg.addColorStop(0, "rgba(255,121,198,0.22)");
  cg.addColorStop(1, "rgba(255,121,198,0)");
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, H);

  // Top border
  const tl = ctx.createLinearGradient(0, 0, W, 0);
  tl.addColorStop(0,   "rgba(255,121,198,0)");
  tl.addColorStop(0.5, "rgba(255,121,198,0.95)");
  tl.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = tl;
  ctx.fillRect(0, 0, W, 2);

  // Bottom border
  const bl = ctx.createLinearGradient(0, 0, W, 0);
  bl.addColorStop(0,   "rgba(189,147,249,0)");
  bl.addColorStop(0.5, "rgba(189,147,249,0.95)");
  bl.addColorStop(1,   "rgba(189,147,249,0)");
  ctx.fillStyle = bl;
  ctx.fillRect(0, H - 2, W, 2);

  // Decorations
  const decos = [
    { t: "✿", x: 44,  y: 40,  s: 26, c: "#ff79c6", a: 0.58 },
    { t: "✿", x: 656, y: 40,  s: 26, c: "#ff79c6", a: 0.58 },
    { t: "✿", x: 44,  y: 155, s: 18, c: "#b2f7ef", a: 0.48 },
    { t: "✿", x: 656, y: 155, s: 18, c: "#b2f7ef", a: 0.48 },
    { t: "✦", x: 118, y: 98,  s: 16, c: "#ffd700", a: 0.55 },
    { t: "✦", x: 582, y: 98,  s: 16, c: "#ffd700", a: 0.55 },
    { t: "♡", x: 26,  y: 98,  s: 15, c: "#ff79c6", a: 0.48 },
    { t: "♡", x: 674, y: 98,  s: 15, c: "#ff79c6", a: 0.48 },
    { t: "·",  x: 162, y: 28,  s: 16, c: "#ffd700", a: 0.55 },
    { t: "·",  x: 538, y: 28,  s: 16, c: "#ffd700", a: 0.55 },
    { t: "·",  x: 162, y: 168, s: 15, c: "#c9b1ff", a: 0.5  },
    { t: "·",  x: 538, y: 168, s: 15, c: "#c9b1ff", a: 0.5  },
    { t: "✿", x: 350, y: 14,  s: 12, c: "#ffb3de", a: 0.35 },
    { t: "✿", x: 350, y: 182, s: 12, c: "#ffb3de", a: 0.35 },
  ];
  for (const d of decos) glyph(ctx, d.t, d.x, d.y, d.s, d.c, d.a);

  // Main title
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const tGrad = ctx.createLinearGradient(W / 2 - 195, 0, W / 2 + 195, 0);
  tGrad.addColorStop(0,   "#ff79c6");
  tGrad.addColorStop(0.5, "#fffce0");
  tGrad.addColorStop(1,   "#bd93f9");
  ctx.fillStyle = tGrad;
  ctx.font      = "bold 54px sans-serif";
  ctx.fillText("✿ Kawaii Bot ✿", W / 2, H / 2 - 24);

  // Subtitle
  ctx.fillStyle = "rgba(255,179,222,0.82)";
  ctx.font      = "17px sans-serif";
  ctx.fillText("♡ Your cute economy, anime & fun companion~ ♡", W / 2, H / 2 + 22);

  // Tag line
  ctx.fillStyle = "rgba(201,177,255,0.62)";
  ctx.font      = "13px sans-serif";
  ctx.fillText("✦ Slash Commands Ready  •  Type /help anytime  •  27 commands~ ✦", W / 2, H / 2 + 50);

  return canvas.toBuffer("image/png");
}

// ── Help Thumbnail Card ───────────────────────────────────────────────────────

export async function createHelpThumbnail(): Promise<Buffer> {
  const W = 256, H = 256;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Background (radial)
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.72);
  bg.addColorStop(0,   "#7b2d8b");
  bg.addColorStop(0.5, "#3d1178");
  bg.addColorStop(1,   "#1a0535");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Pink shimmer overlay
  const ov = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 110);
  ov.addColorStop(0, "rgba(255,121,198,0.28)");
  ov.addColorStop(1, "rgba(255,121,198,0)");
  ctx.fillStyle = ov;
  ctx.fillRect(0, 0, W, H);

  // Gradient border
  ctx.save();
  roundRect(ctx, 5, 5, W - 10, H - 10, 20);
  const bdr = ctx.createLinearGradient(0, 0, W, H);
  bdr.addColorStop(0,   "rgba(255,121,198,0.72)");
  bdr.addColorStop(0.5, "rgba(189,147,249,0.72)");
  bdr.addColorStop(1,   "rgba(255,121,198,0.72)");
  ctx.strokeStyle = bdr;
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.restore();

  // Big center flower
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha  = 0.92;
  ctx.fillStyle    = "#ff79c6";
  ctx.font         = "82px sans-serif";
  ctx.fillText("✿", W / 2, H / 2 - 22);
  ctx.globalAlpha  = 1;

  // Label gradient
  const lg = ctx.createLinearGradient(W / 2 - 65, 0, W / 2 + 65, 0);
  lg.addColorStop(0, "#ff79c6");
  lg.addColorStop(1, "#bd93f9");
  ctx.fillStyle = lg;
  ctx.font      = "bold 20px sans-serif";
  ctx.fillText("Kawaii Bot", W / 2, H / 2 + 57);

  // Corner hearts
  glyph(ctx, "♡", 28,  28,  17, "#ff79c6", 0.62);
  glyph(ctx, "♡", 228, 28,  17, "#ff79c6", 0.62);
  glyph(ctx, "♡", 28,  228, 14, "#c9b1ff", 0.52);
  glyph(ctx, "♡", 228, 228, 14, "#c9b1ff", 0.52);
  glyph(ctx, "✦", W / 2, 20, 13, "#ffd700", 0.65);
  glyph(ctx, "✦", W / 2, 238, 11, "#ffd700", 0.5);

  return canvas.toBuffer("image/png");
}

// ── Leaderboard Banner ────────────────────────────────────────────────────────

export async function createLeaderboardBanner(type: string): Promise<Buffer> {
  const W = 700, H = 180;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Type-specific theme
  let c1: string, c2: string, icon: string, label: string, accent: string;
  if (type === "xp") {
    c1 = "#0a1628"; c2 = "#1a3560"; icon = "✦"; label = "XP Rankings~"; accent = "#60a5fa";
  } else if (type === "streak") {
    c1 = "#250808"; c2 = "#6b1818"; icon = "✦"; label = "Streak Rankings~"; accent = "#f97316";
  } else {
    c1 = "#140e00"; c2 = "#4a3000"; icon = "✦"; label = "Wealth Rankings~"; accent = "#fbbf24";
  }

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   c1);
  bg.addColorStop(0.5, c2);
  bg.addColorStop(1,   c1);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Kawaii pink overlay (keeps it cute for all types)
  const pk = ctx.createLinearGradient(0, 0, W, H);
  pk.addColorStop(0,   "rgba(255,121,198,0.09)");
  pk.addColorStop(0.5, "rgba(255,121,198,0.04)");
  pk.addColorStop(1,   "rgba(255,121,198,0.09)");
  ctx.fillStyle = pk;
  ctx.fillRect(0, 0, W, H);

  // Center accent glow
  const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 210);
  cg.addColorStop(0, `rgba(${hexToRgb(accent)},0.22)`);
  cg.addColorStop(1, `rgba(${hexToRgb(accent)},0)`);
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, H);

  // Top accent line
  const tl = ctx.createLinearGradient(0, 0, W, 0);
  tl.addColorStop(0,   "rgba(255,121,198,0)");
  tl.addColorStop(0.5, `rgba(${hexToRgb(accent)},1)`);
  tl.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = tl;
  ctx.fillRect(0, 0, W, 2.5);

  // Bottom pink line
  const bl = ctx.createLinearGradient(0, 0, W, 0);
  bl.addColorStop(0,   "rgba(255,121,198,0)");
  bl.addColorStop(0.5, "rgba(255,121,198,0.85)");
  bl.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = bl;
  ctx.fillRect(0, H - 2.5, W, 2.5);

  // Decorative elements
  const decos = [
    { t: "✿", x: 42,  y: 38,  s: 23, c: "#ff79c6",  a: 0.52 },
    { t: "✿", x: 658, y: 38,  s: 23, c: "#ff79c6",  a: 0.52 },
    { t: "✿", x: 42,  y: 143, s: 17, c: "#ffb3de",  a: 0.42 },
    { t: "✿", x: 658, y: 143, s: 17, c: "#ffb3de",  a: 0.42 },
    { t: "♡", x: 108, y: 90,  s: 15, c: "#ff79c6",  a: 0.48 },
    { t: "♡", x: 592, y: 90,  s: 15, c: "#ff79c6",  a: 0.48 },
    { t: "·",  x: 168, y: 26,  s: 16, c: accent,     a: 0.65 },
    { t: "·",  x: 532, y: 26,  s: 16, c: accent,     a: 0.65 },
    { t: "·",  x: 168, y: 155, s: 15, c: accent,     a: 0.55 },
    { t: "·",  x: 532, y: 155, s: 15, c: accent,     a: 0.55 },
    { t: icon, x: W / 2 - 128, y: H / 2, s: 30, c: accent, a: 0.6 },
    { t: icon, x: W / 2 + 128, y: H / 2, s: 30, c: accent, a: 0.6 },
  ];
  for (const d of decos) glyph(ctx, d.t, d.x, d.y, d.s, d.c, d.a);

  // "LEADERBOARD" title
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const tg = ctx.createLinearGradient(W / 2 - 165, 0, W / 2 + 165, 0);
  tg.addColorStop(0,   "#ff79c6");
  tg.addColorStop(0.5, "#fffce0");
  tg.addColorStop(1,   "#bd93f9");
  ctx.fillStyle = tg;
  ctx.font      = "bold 50px sans-serif";
  ctx.fillText("Leaderboard", W / 2, H / 2 - 20);

  // Subtitle
  ctx.fillStyle = `rgba(${hexToRgb(accent)},0.92)`;
  ctx.font      = "18px sans-serif";
  ctx.fillText(`✿ ${label} ♡`, W / 2, H / 2 + 24);

  // Tag line
  ctx.fillStyle = "rgba(255,179,222,0.55)";
  ctx.font      = "13px sans-serif";
  ctx.fillText("♡ Kawaii Bot  •  Top 10 Players  •  (◕ᴗ◕✿)", W / 2, H / 2 + 52);

  return canvas.toBuffer("image/png");
}
