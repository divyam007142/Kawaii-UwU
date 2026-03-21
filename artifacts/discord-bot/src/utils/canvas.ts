import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import axios from "axios";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function loadImageFromUrl(url: string) {
  const res  = await axios.get(url, { responseType: "arraybuffer", timeout: 6000 });
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

function drawStar(ctx: any, x: number, y: number, size: number, color: string, opacity = 0.6) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle   = color;
  ctx.font        = `${size}px sans-serif`;
  ctx.textAlign   = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦", x, y);
  ctx.restore();
}

function drawFlower(ctx: any, x: number, y: number, size: number, opacity = 0.5) {
  ctx.save();
  ctx.globalAlpha  = opacity;
  ctx.fillStyle    = "#ffb3de";
  ctx.font         = `${size}px sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✿", x, y);
  ctx.restore();
}

// ── Welcome Card ─────────────────────────────────────────────────────────────

export async function createWelcomeCard(
  avatarUrl: string,
  username: string,
  serverName: string,
  memberCount: number
): Promise<Buffer> {
  const W = 900, H = 280;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#1a0a2e");
  bg.addColorStop(0.4, "#2d1060");
  bg.addColorStop(0.7, "#4a1080");
  bg.addColorStop(1,   "#1a0a2e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle noise overlay ──
  const noise = ctx.createLinearGradient(0, 0, 0, H);
  noise.addColorStop(0,   "rgba(255,121,198,0.08)");
  noise.addColorStop(0.5, "rgba(189,147,249,0.05)");
  noise.addColorStop(1,   "rgba(255,121,198,0.08)");
  ctx.fillStyle = noise;
  ctx.fillRect(0, 0, W, H);

  // ── Glow circles ──
  const glow1 = ctx.createRadialGradient(150, 140, 10, 150, 140, 130);
  glow1.addColorStop(0,   "rgba(255,121,198,0.25)");
  glow1.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(750, 140, 10, 750, 140, 150);
  glow2.addColorStop(0,   "rgba(189,147,249,0.2)");
  glow2.addColorStop(1,   "rgba(189,147,249,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative elements ──
  const decos = [
    { x: 60,  y: 35,  s: 16, o: 0.4 },
    { x: 820, y: 40,  s: 18, o: 0.4 },
    { x: 40,  y: 230, s: 14, o: 0.3 },
    { x: 860, y: 240, s: 16, o: 0.35 },
    { x: 460, y: 25,  s: 12, o: 0.3 },
    { x: 550, y: 255, s: 14, o: 0.3 },
    { x: 700, y: 55,  s: 10, o: 0.25 },
    { x: 350, y: 260, s: 12, o: 0.3 },
  ];
  for (const d of decos) drawFlower(ctx, d.x, d.y, d.s, d.o);

  const stars = [
    { x: 110, y: 60,  s: 10 },
    { x: 800, y: 80,  s: 12 },
    { x: 500, y: 255, s: 9  },
    { x: 640, y: 35,  s: 11 },
    { x: 80,  y: 200, s: 8  },
    { x: 840, y: 200, s: 10 },
    { x: 380, y: 22,  s: 8  },
  ];
  for (const s of stars) drawStar(ctx, s.x, s.y, s.s, "#ffb3de", 0.5);

  // ── Card border glow ──
  ctx.save();
  roundRect(ctx, 8, 8, W - 16, H - 16, 20);
  ctx.strokeStyle = "rgba(255,121,198,0.4)";
  ctx.lineWidth   = 2;
  ctx.stroke();
  ctx.restore();

  // ── Inner card panel ──
  ctx.save();
  roundRect(ctx, 20, 20, W - 40, H - 40, 16);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fill();
  ctx.restore();

  // ── Divider line ──
  const divider = ctx.createLinearGradient(290, 0, 292, H);
  divider.addColorStop(0,   "rgba(255,121,198,0)");
  divider.addColorStop(0.5, "rgba(255,121,198,0.5)");
  divider.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = divider;
  ctx.fillRect(290, 40, 2, H - 80);

  // ── Avatar ──
  try {
    const avatar = await loadImageFromUrl(avatarUrl + "?size=256");
    // Avatar ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, H / 2, 87, 0, Math.PI * 2);
    ctx.strokeStyle = "#ff79c6";
    ctx.lineWidth   = 4;
    ctx.stroke();
    ctx.restore();

    // Avatar glow
    const aGlow = ctx.createRadialGradient(150, H / 2, 70, 150, H / 2, 95);
    aGlow.addColorStop(0,   "rgba(255,121,198,0.3)");
    aGlow.addColorStop(1,   "rgba(255,121,198,0)");
    ctx.fillStyle = aGlow;
    ctx.beginPath();
    ctx.arc(150, H / 2, 95, 0, Math.PI * 2);
    ctx.fill();

    drawCircleAvatar(ctx, avatar, 150, H / 2, 82);
  } catch { /* skip avatar on error */ }

  // ── Text area ──
  const textX = 320;

  // "WELCOME" label
  const wGrad = ctx.createLinearGradient(textX, 60, textX + 300, 100);
  wGrad.addColorStop(0, "#ff79c6");
  wGrad.addColorStop(1, "#bd93f9");
  ctx.fillStyle    = wGrad;
  ctx.font         = "bold 42px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("✿ WELCOME ✿", textX, 52);

  // Username
  ctx.fillStyle = "#ffffff";
  ctx.font      = "bold 32px sans-serif";
  const displayName = username.length > 18 ? username.slice(0, 17) + "…" : username;
  ctx.fillText(displayName, textX, 106);

  // Pink accent line
  const accent = ctx.createLinearGradient(textX, 0, textX + 250, 0);
  accent.addColorStop(0, "#ff79c6");
  accent.addColorStop(1, "rgba(255,121,198,0)");
  ctx.fillStyle = accent;
  ctx.fillRect(textX, 148, 260, 2);

  // Server name
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font      = "18px sans-serif";
  const sName = serverName.length > 28 ? serverName.slice(0, 27) + "…" : serverName;
  ctx.fillText(`You joined ${sName}~!! ♡`, textX, 162);

  // Member count pill
  ctx.save();
  roundRect(ctx, textX, 195, 200, 34, 17);
  ctx.fillStyle = "rgba(255,121,198,0.2)";
  ctx.fill();
  roundRect(ctx, textX, 195, 200, 34, 17);
  ctx.strokeStyle = "rgba(255,121,198,0.4)";
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle    = "#ff79c6";
  ctx.font         = "bold 16px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(`Member #${memberCount}`, textX + 20, 212);

  // Cute sub-text
  ctx.fillStyle    = "rgba(255,255,255,0.45)";
  ctx.font         = "14px sans-serif";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Use /help to see what I can do~ (◕ᴗ◕✿)", textX, 250);

  return canvas.toBuffer("image/png");
}

// ── Help Banner ──────────────────────────────────────────────────────────────

export async function createHelpBanner(): Promise<Buffer> {
  const W = 700, H = 160;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext("2d") as any;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#1a0a2e");
  bg.addColorStop(0.5, "#3d1178");
  bg.addColorStop(1,   "#1a0a2e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Pink shimmer
  const shimmer = ctx.createLinearGradient(0, 0, W, 0);
  shimmer.addColorStop(0,   "rgba(255,121,198,0)");
  shimmer.addColorStop(0.5, "rgba(255,121,198,0.12)");
  shimmer.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = shimmer;
  ctx.fillRect(0, 0, W, H);

  // Top and bottom border lines
  const line = ctx.createLinearGradient(0, 0, W, 0);
  line.addColorStop(0,   "rgba(255,121,198,0)");
  line.addColorStop(0.5, "rgba(255,121,198,0.8)");
  line.addColorStop(1,   "rgba(255,121,198,0)");
  ctx.fillStyle = line;
  ctx.fillRect(0, 0, W, 2);
  ctx.fillRect(0, H - 2, W, 2);

  // Decorations
  const items = [
    { x: 50,  y: 35,  s: 22, t: "✿" },
    { x: 650, y: 35,  s: 22, t: "✿" },
    { x: 50,  y: 130, s: 16, t: "♡" },
    { x: 650, y: 130, s: 16, t: "♡" },
    { x: 120, y: 80,  s: 14, t: "✦" },
    { x: 580, y: 80,  s: 14, t: "✦" },
    { x: 30,  y: 80,  s: 12, t: "·" },
    { x: 670, y: 80,  s: 12, t: "·" },
  ];
  for (const d of items) {
    ctx.save();
    ctx.globalAlpha  = 0.5;
    ctx.fillStyle    = "#ff79c6";
    ctx.font         = `${d.s}px sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.t, d.x, d.y);
    ctx.restore();
  }

  // Main title gradient
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  const title = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
  title.addColorStop(0, "#ff79c6");
  title.addColorStop(0.5, "#ffffff");
  title.addColorStop(1, "#bd93f9");
  ctx.fillStyle = title;
  ctx.font      = "bold 48px sans-serif";
  ctx.fillText("Kawaii Bot", W / 2, H / 2 - 12);

  // Subtitle
  ctx.fillStyle = "rgba(255,179,222,0.75)";
  ctx.font      = "18px sans-serif";
  ctx.fillText("✿ Premium Cute Bot — /help for commands ♡", W / 2, H / 2 + 34);

  return canvas.toBuffer("image/png");
}
