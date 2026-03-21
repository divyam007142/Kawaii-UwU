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
  const W = 700, H = 200;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND: Anime night sky
  // ─────────────────────────────────────────────────────────────────────────

  // 1. Deep night sky base (dark indigo → midnight navy)
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0,    "#060118");
  sky.addColorStop(0.35, "#0e0230");
  sky.addColorStop(0.7,  "#1a0545");
  sky.addColorStop(1,    "#100335");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // 2. Horizontal colour sweep (indigo → deep magenta → indigo)
  const sweep = ctx.createLinearGradient(0, 0, W, 0);
  sweep.addColorStop(0,    "rgba(10,2,40,0.6)");
  sweep.addColorStop(0.35, "rgba(80,10,140,0.35)");
  sweep.addColorStop(0.65, "rgba(160,20,100,0.35)");
  sweep.addColorStop(1,    "rgba(10,2,40,0.6)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, W, H);

  // 3. Pink nebula cloud — left area
  const neb1 = ctx.createRadialGradient(160, 70, 0, 160, 70, 200);
  neb1.addColorStop(0,   "rgba(255,80,165,0.24)");
  neb1.addColorStop(0.5, "rgba(200,50,140,0.1)");
  neb1.addColorStop(1,   "rgba(255,80,165,0)");
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, W, H);

  // 4. Purple nebula cloud — right area
  const neb2 = ctx.createRadialGradient(540, 120, 0, 540, 120, 190);
  neb2.addColorStop(0,   "rgba(150,70,255,0.22)");
  neb2.addColorStop(0.5, "rgba(110,50,200,0.08)");
  neb2.addColorStop(1,   "rgba(150,70,255,0)");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, W, H);

  // 5. Soft teal glow at bottom centre
  const teal = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 160);
  teal.addColorStop(0, "rgba(60,220,200,0.1)");
  teal.addColorStop(1, "rgba(60,220,200,0)");
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, W, H);

  // ─────────────────────────────────────────────────────────────────────────
  // BOKEH CIRCLES (dreamy depth effect)
  // ─────────────────────────────────────────────────────────────────────────
  const bokehList = [
    { x: 48,  y: 28,  r: 32, r1: "rgba(255,90,180,0.07)",   r0: "rgba(255,90,180,0)"  },
    { x: 80,  y: 158, r: 22, r1: "rgba(190,90,255,0.08)",   r0: "rgba(190,90,255,0)"  },
    { x: 620, y: 22,  r: 36, r1: "rgba(140,70,255,0.07)",   r0: "rgba(140,70,255,0)"  },
    { x: 658, y: 162, r: 24, r1: "rgba(255,110,200,0.08)",  r0: "rgba(255,110,200,0)" },
    { x: 350, y: 14,  r: 20, r1: "rgba(255,200,230,0.06)",  r0: "rgba(255,200,230,0)" },
    { x: 265, y: 178, r: 28, r1: "rgba(170,90,255,0.07)",   r0: "rgba(170,90,255,0)"  },
    { x: 430, y: 185, r: 18, r1: "rgba(255,150,220,0.06)",  r0: "rgba(255,150,220,0)" },
  ];
  for (const b of bokehList) {
    const bg2 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    bg2.addColorStop(0, b.r1);
    bg2.addColorStop(1, b.r0);
    ctx.fillStyle = bg2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CRESCENT MOON — top-left corner
  // ─────────────────────────────────────────────────────────────────────────
  const mx = 58, my = 46, mr = 26;

  // Moon outer glow
  const moonGlow = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 2.4);
  moonGlow.addColorStop(0,   "rgba(255,248,200,0.28)");
  moonGlow.addColorStop(0.5, "rgba(255,240,180,0.1)");
  moonGlow.addColorStop(1,   "rgba(255,240,180,0)");
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(mx, my, mr * 2.4, 0, Math.PI * 2);
  ctx.fill();

  // Moon body
  ctx.fillStyle = "#fff9e6";
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();

  // Crescent cutout (overlay sky colour)
  ctx.fillStyle = "#0e0230";
  ctx.beginPath();
  ctx.arc(mx + 11, my - 6, mr * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // ─────────────────────────────────────────────────────────────────────────
  // STARS — small glowing circles
  // ─────────────────────────────────────────────────────────────────────────
  const starList = [
    // top band
    { x: 108, y: 12, r: 1.8, g: 7  },
    { x: 142, y: 32, r: 1.1, g: 4  },
    { x: 178, y: 10, r: 2.2, g: 9  },
    { x: 215, y: 22, r: 1.0, g: 4  },
    { x: 255, y: 8,  r: 1.5, g: 6  },
    { x: 308, y: 18, r: 1.8, g: 7  },
    { x: 348, y: 7,  r: 1.0, g: 4  },
    { x: 390, y: 15, r: 2.0, g: 8  },
    { x: 432, y: 9,  r: 1.2, g: 5  },
    { x: 468, y: 24, r: 1.6, g: 6  },
    { x: 505, y: 10, r: 2.2, g: 9  },
    { x: 542, y: 28, r: 1.0, g: 4  },
    { x: 575, y: 12, r: 1.8, g: 7  },
    { x: 612, y: 22, r: 1.1, g: 4  },
    { x: 645, y: 8,  r: 2.0, g: 8  },
    { x: 680, y: 18, r: 1.4, g: 5  },
    // sides / scattered
    { x: 22,  y: 120, r: 1.0, g: 4 },
    { x: 688, y: 88,  r: 1.2, g: 5 },
    { x: 678, y: 140, r: 1.0, g: 4 },
    { x: 18,  y: 75,  r: 1.4, g: 5 },
    { x: 112, y: 55,  r: 1.0, g: 4 },
    { x: 588, y: 55,  r: 1.0, g: 4 },
  ];
  for (const s of starList) {
    // Soft halo
    const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.g);
    halo.addColorStop(0, "rgba(255,255,255,0.2)");
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.g, 0, Math.PI * 2);
    ctx.fill();
    // Star core
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAKURA PETALS — drawn as rotated ovals with gradient fill
  // ─────────────────────────────────────────────────────────────────────────
  function drawPetal(px: number, py: number, rot: number, sz: number, alpha: number) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(px, py);
    ctx.rotate(rot);
    const pg = ctx.createRadialGradient(0, -sz * 0.2, 0, 0, sz * 0.3, sz);
    pg.addColorStop(0,   "rgba(255,210,230,0.95)");
    pg.addColorStop(0.55, "rgba(255,160,200,0.7)");
    pg.addColorStop(1,   "rgba(255,120,175,0)");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.42, sz, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const petalList = [
    { x: 8,   y: 58,  r: 0.38,  s: 13, a: 0.55 },
    { x: 30,  y: 142, r: -0.85, s: 11, a: 0.48 },
    { x: 68,  y: 108, r: 1.22,  s: 9,  a: 0.42 },
    { x: 618, y: 48,  r: -0.52, s: 12, a: 0.52 },
    { x: 652, y: 142, r: 0.88,  s: 10, a: 0.46 },
    { x: 690, y: 96,  r: -1.15, s: 9,  a: 0.42 },
    { x: 272, y: 180, r: 0.6,   s: 8,  a: 0.38 },
    { x: 418, y: 185, r: -0.3,  s: 10, a: 0.4  },
    { x: 132, y: 168, r: 1.05,  s: 8,  a: 0.36 },
    { x: 558, y: 178, r: -0.72, s: 9,  a: 0.4  },
    { x: 340, y: 10,  r: 0.9,   s: 7,  a: 0.3  },
    { x: 480, y: 5,   r: -0.4,  s: 8,  a: 0.32 },
  ];
  for (const p of petalList) drawPetal(p.x, p.y, p.r, p.s, p.a);

  // ─────────────────────────────────────────────────────────────────────────
  // 4-POINTED SPARKLE GLYPHS
  // ─────────────────────────────────────────────────────────────────────────
  const sparkleList = [
    { x: 118, y: 40,  s: 13, c: "#ffd700", a: 0.7 },
    { x: 582, y: 44,  s: 12, c: "#ffd700", a: 0.65 },
    { x: 198, y: 168, s: 11, c: "#ff9de2", a: 0.6 },
    { x: 502, y: 165, s: 11, c: "#ff9de2", a: 0.6 },
    { x: 350, y: 188, s: 10, c: "#ffd700", a: 0.48 },
    { x: 350, y: 10,  s: 10, c: "#c9b1ff", a: 0.45 },
  ];
  for (const sp of sparkleList) glyph(ctx, "✦", sp.x, sp.y, sp.s, sp.c, sp.a);

  // ─────────────────────────────────────────────────────────────────────────
  // BORDER LINES
  // ─────────────────────────────────────────────────────────────────────────
  const tBorder = ctx.createLinearGradient(0, 0, W, 0);
  tBorder.addColorStop(0,   "rgba(255,121,198,0)");
  tBorder.addColorStop(0.5, "rgba(255,121,198,0.95)");
  tBorder.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = tBorder;
  ctx.fillRect(0, 0, W, 2.5);

  const bBorder = ctx.createLinearGradient(0, 0, W, 0);
  bBorder.addColorStop(0,   "rgba(189,147,249,0)");
  bBorder.addColorStop(0.5, "rgba(189,147,249,0.95)");
  bBorder.addColorStop(1,   "rgba(189,147,249,0)");
  ctx.fillStyle = bBorder;
  ctx.fillRect(0, H - 2.5, W, 2.5);

  // ─────────────────────────────────────────────────────────────────────────
  // TEXT
  // ─────────────────────────────────────────────────────────────────────────
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  // Title with glow
  ctx.save();
  ctx.shadowColor = "rgba(255,105,180,0.9)";
  ctx.shadowBlur  = 22;
  const tGrad = ctx.createLinearGradient(W / 2 - 205, 0, W / 2 + 205, 0);
  tGrad.addColorStop(0,   "#ff79c6");
  tGrad.addColorStop(0.5, "#fffce0");
  tGrad.addColorStop(1,   "#bd93f9");
  ctx.fillStyle = tGrad;
  ctx.font      = "bold 54px sans-serif";
  ctx.fillText("✿ Kawaii Bot ✿", W / 2, H / 2 - 26);
  ctx.restore();

  // Subtitle with soft glow
  ctx.save();
  ctx.shadowColor = "rgba(255,100,180,0.55)";
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = "rgba(255,182,222,0.9)";
  ctx.font        = "17px sans-serif";
  ctx.fillText("♡ Your cute economy, anime & fun companion~ ♡", W / 2, H / 2 + 22);
  ctx.restore();

  // Tag line
  ctx.fillStyle = "rgba(201,177,255,0.68)";
  ctx.font      = "13px sans-serif";
  ctx.fillText("✦ Slash Commands Ready  •  Type /help anytime  •  27 commands~ ✦", W / 2, H / 2 + 52);

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
