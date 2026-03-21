import { Router } from "express";

const router = Router();

const HTML = /* html */`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>✿ Kawaii Bot Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #080014;
      color: #e2e0f0;
      min-height: 100vh;
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #160330 0%, #3b0d7a 50%, #160330 100%);
      border-bottom: 1px solid rgba(255,121,198,0.25);
      padding: 22px 32px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .avatar-wrap { position: relative; flex-shrink: 0; }
    .bot-avatar {
      width: 68px; height: 68px; border-radius: 50%;
      border: 3px solid #ff79c6;
      object-fit: cover;
      background: #3b0764;
    }
    .online-ring {
      position: absolute; bottom: 2px; right: 2px;
      width: 16px; height: 16px; border-radius: 50%;
      background: #23d160;
      border: 3px solid #160330;
    }
    .bot-name {
      font-size: 22px; font-weight: 700; line-height: 1;
      background: linear-gradient(90deg, #ff79c6, #bd93f9);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .bot-tag { font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 4px; }
    .online-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(35,209,96,0.12);
      border: 1px solid rgba(35,209,96,0.35);
      border-radius: 999px; padding: 3px 11px;
      font-size: 12px; color: #4ade80; margin-top: 8px;
      width: fit-content;
    }
    .pulse {
      width: 7px; height: 7px; border-radius: 50%; background: #4ade80;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

    /* ── Main ── */
    .main { padding: 28px 32px; max-width: 1080px; margin: 0 auto; }

    /* ── Live bar ── */
    .live-bar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 22px;
    }
    .live-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,121,198,0.1);
      border: 1px solid rgba(255,121,198,0.28);
      border-radius: 999px; padding: 4px 13px;
      font-size: 12px; color: #ff79c6;
    }
    .updated { font-size: 12px; color: rgba(255,255,255,0.28); }

    /* ── Section title ── */
    .section {
      font-size: 11px; font-weight: 600; letter-spacing: .1em;
      text-transform: uppercase; color: rgba(255,255,255,0.35);
      padding-bottom: 10px; margin-bottom: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    /* ── Stats grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
      gap: 14px; margin-bottom: 28px;
    }
    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,121,198,0.15);
      border-radius: 12px; padding: 18px 18px 16px;
      transition: border-color .2s, transform .15s;
      cursor: default;
    }
    .card:hover { border-color: rgba(255,121,198,0.38); transform: translateY(-2px); }
    .card-icon  { font-size: 26px; margin-bottom: 10px; }
    .card-label { font-size: 11px; color: rgba(255,255,255,0.38); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 4px; }
    .card-value { font-size: 26px; font-weight: 700; color: #fff; line-height: 1; }
    .card-value.sm { font-size: 18px; }

    /* ── Commands ── */
    .cmds {
      display: flex; flex-wrap: wrap; gap: 8px;
      margin-bottom: 28px;
    }
    .cmd {
      background: rgba(189,147,249,0.09);
      border: 1px solid rgba(189,147,249,0.2);
      border-radius: 8px; padding: 6px 12px;
      font-size: 13px; color: #bd93f9;
    }

    /* ── Footer ── */
    footer {
      text-align: center; padding: 20px 0;
      font-size: 12px; color: rgba(255,255,255,0.18);
      border-top: 1px solid rgba(255,255,255,0.06);
    }
  </style>
</head>
<body>

<div class="header">
  <div class="avatar-wrap">
    <img id="avatar" class="bot-avatar" src="" alt="Bot" />
    <div class="online-ring"></div>
  </div>
  <div>
    <div id="botName" class="bot-name">Kawaii Bot</div>
    <div id="botTag"  class="bot-tag">#3339</div>
    <div class="online-badge"><div class="pulse"></div> ONLINE</div>
  </div>
</div>

<div class="main">
  <div class="live-bar">
    <div class="live-badge"><div class="pulse"></div> Live Dashboard</div>
    <div class="updated" id="updatedAt">Connecting…</div>
  </div>

  <div class="section">Overview</div>
  <div class="grid">
    <div class="card">
      <div class="card-icon">🌐</div>
      <div class="card-label">Servers</div>
      <div class="card-value" id="servers">—</div>
    </div>
    <div class="card">
      <div class="card-icon">👥</div>
      <div class="card-label">Total Members</div>
      <div class="card-value" id="users">—</div>
    </div>
    <div class="card">
      <div class="card-icon">⏱️</div>
      <div class="card-label">Uptime</div>
      <div class="card-value sm" id="uptime">—</div>
    </div>
    <div class="card">
      <div class="card-icon">⚡</div>
      <div class="card-label">Commands</div>
      <div class="card-value" id="commands">—</div>
    </div>
    <div class="card">
      <div class="card-icon">📝</div>
      <div class="card-label">Registered Users</div>
      <div class="card-value" id="registeredUsers">—</div>
    </div>
    <div class="card">
      <div class="card-icon">🪙</div>
      <div class="card-label">Void Coins in Circulation</div>
      <div class="card-value sm" id="totalCoins">—</div>
    </div>
  </div>

  <div class="section">Commands</div>
  <div class="cmds">
    <div class="cmd">🎭 /meme</div><div class="cmd">🌸 /anime</div>
    <div class="cmd">😄 /joke</div><div class="cmd">💬 /quote</div>
    <div class="cmd">😏 /pickup</div><div class="cmd">🔥 /roast</div>
    <div class="cmd">🎯 /bored</div><div class="cmd">🧠 /trivia</div>
    <div class="cmd">🤔 /wyr</div><div class="cmd">🪙 /coinflip</div>
    <div class="cmd">🎯 /guess</div><div class="cmd">🎰 /gamble</div>
    <div class="cmd">💰 /balance</div><div class="cmd">📅 /daily</div>
    <div class="cmd">💼 /work</div><div class="cmd">🙏 /beg</div>
    <div class="cmd">🏦 /deposit</div><div class="cmd">💸 /withdraw</div>
    <div class="cmd">🏪 /shop</div><div class="cmd">🛒 /buy</div>
    <div class="cmd">💱 /sell</div><div class="cmd">🎒 /inventory</div>
    <div class="cmd">📦 /lootbox</div><div class="cmd">🤝 /trade</div>
    <div class="cmd">🏆 /leaderboard</div><div class="cmd">❓ /help</div>
    <div class="cmd">⚙️ /setup</div>
  </div>
</div>

<footer>✿ Kawaii Bot Dashboard ♡ — updates every 5 seconds</footer>

<script>
  function fmtUptime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)  return h + 'h ' + m + 'm ' + sec + 's';
    if (m > 0)  return m + 'm ' + sec + 's';
    return sec + 's';
  }
  function fmtNum(n) {
    return (parseInt(n) || 0).toLocaleString();
  }

  async function fetchStats() {
    try {
      const res  = await fetch('./stats');
      if (!res.ok) throw new Error();
      const d    = await res.json();

      if (d.avatar) document.getElementById('avatar').src = d.avatar;
      const parts = (d.tag || 'Kawaii#3339').split('#');
      document.getElementById('botName').textContent = parts[0] || 'Kawaii Bot';
      document.getElementById('botTag').textContent  = '#' + (parts[1] || '');

      document.getElementById('servers').textContent         = fmtNum(d.servers);
      document.getElementById('users').textContent           = fmtNum(d.users);
      document.getElementById('uptime').textContent          = fmtUptime(d.uptime || 0);
      document.getElementById('commands').textContent        = fmtNum(d.commands);
      document.getElementById('registeredUsers').textContent = fmtNum(d.registeredUsers);
      document.getElementById('totalCoins').textContent      = fmtNum(d.totalCoins);

      if (d.updatedAt) {
        const t = new Date(d.updatedAt);
        document.getElementById('updatedAt').textContent = 'Updated ' + t.toLocaleTimeString();
      }
    } catch {
      document.getElementById('updatedAt').textContent = 'Waiting for bot data…';
    }
  }

  fetchStats();
  setInterval(fetchStats, 5000);
</script>
</body>
</html>`;

router.get("/dashboard", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(HTML);
});

export default router;
