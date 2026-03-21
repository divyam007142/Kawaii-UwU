import { Client } from "discord.js";

// ANSI color codes
const c = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",

  pink:    "\x1b[38;5;213m",
  hotpink: "\x1b[38;5;198m",
  purple:  "\x1b[38;5;141m",
  cyan:    "\x1b[38;5;51m",
  yellow:  "\x1b[38;5;228m",
  green:   "\x1b[38;5;120m",
  white:   "\x1b[97m",
  gray:    "\x1b[38;5;245m",

  bgPink:  "\x1b[48;5;198m",
  bgPurp:  "\x1b[48;5;93m",
};

const KAWAII_ART = `
${c.hotpink}${c.bold}██╗  ██╗${c.reset}${c.pink}${c.bold} █████╗ ${c.reset}${c.purple}${c.bold}██╗    ██╗${c.reset}${c.pink}${c.bold} █████╗ ${c.reset}${c.hotpink}${c.bold}██╗██╗${c.reset}
${c.hotpink}${c.bold}██║ ██╔╝${c.reset}${c.pink}${c.bold}██╔══██╗${c.reset}${c.purple}${c.bold}██║    ██║${c.reset}${c.pink}${c.bold}██╔══██╗${c.reset}${c.hotpink}${c.bold}██║██║${c.reset}
${c.hotpink}${c.bold}█████╔╝ ${c.reset}${c.pink}${c.bold}███████║${c.reset}${c.purple}${c.bold}██║ █╗ ██║${c.reset}${c.pink}${c.bold}███████║${c.reset}${c.hotpink}${c.bold}██║██║${c.reset}
${c.hotpink}${c.bold}██╔═██╗ ${c.reset}${c.pink}${c.bold}██╔══██║${c.reset}${c.purple}${c.bold}██║███╗██║${c.reset}${c.pink}${c.bold}██╔══██║${c.reset}${c.hotpink}${c.bold}██║██║${c.reset}
${c.hotpink}${c.bold}██║  ██╗${c.reset}${c.pink}${c.bold}██║  ██║${c.reset}${c.purple}${c.bold}╚███╔███╔╝${c.reset}${c.pink}${c.bold}██║  ██║${c.reset}${c.hotpink}${c.bold}██║██║${c.reset}
${c.hotpink}${c.bold}╚═╝  ╚═╝${c.reset}${c.pink}${c.bold}╚═╝  ╚═╝${c.reset}${c.purple}${c.bold} ╚══╝╚══╝ ${c.reset}${c.pink}${c.bold}╚═╝  ╚═╝${c.reset}${c.hotpink}${c.bold}╚═╝╚═╝${c.reset}`;

function line(label: string, value: string): string {
  const pad = 14;
  const labelStr = `${c.gray}${label.padEnd(pad)}${c.reset}`;
  return `  ${c.purple}│${c.reset}  ${labelStr}${c.cyan}${value}${c.reset}`;
}

function divider(char = "─", width = 48): string {
  return `  ${c.purple}${char.repeat(width)}${c.reset}`;
}

function sectionTitle(title: string): string {
  return `  ${c.purple}┤${c.reset} ${c.yellow}${c.bold}${title}${c.reset} ${c.purple}├${c.reset}`;
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export function printBanner(client: Client, commandCount: number, eventCount: number) {
  const tag = client.user?.tag ?? "Unknown";
  const id = client.user?.id ?? "N/A";
  const servers = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
  const uptime = formatUptime(process.uptime() * 1000);
  const clientId = process.env.DISCORD_CLIENT_ID ?? id;
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=388160&scope=bot+applications.commands`;
  const nodeVer = process.version;
  const platform = process.platform;

  const lines: string[] = [];

  lines.push("");
  lines.push(KAWAII_ART);
  lines.push("");
  lines.push(`  ${c.purple}${c.bold}╔${"═".repeat(46)}╗${c.reset}`);
  lines.push(`  ${c.purple}${c.bold}║${c.reset}${" ".repeat(10)}${c.pink}${c.bold}✿ Kawaii Bot — Premium & Cute~ ♡${c.reset}${" ".repeat(3)}${c.purple}${c.bold}║${c.reset}`);
  lines.push(`  ${c.purple}${c.bold}╚${"═".repeat(46)}╝${c.reset}`);
  lines.push("");

  // Bot Info section
  lines.push(`  ${c.purple}┌─${c.reset} ${c.yellow}${c.bold}🌸 Bot Info${c.reset}`);
  lines.push(line("Username",  tag));
  lines.push(line("Client ID", id));
  lines.push(line("Uptime",    uptime));
  lines.push(line("Platform",  `${platform} / ${nodeVer}`));
  lines.push("");

  // Stats section
  lines.push(`  ${c.purple}┌─${c.reset} ${c.yellow}${c.bold}📊 Stats${c.reset}`);
  lines.push(line("Commands",  `${c.green}${commandCount}${c.reset} loaded`));
  lines.push(line("Events",    `${c.green}${eventCount}${c.reset} loaded`));
  lines.push(line("Servers",   `${c.green}${servers}${c.reset}`));
  lines.push(line("Users",     `${c.green}${users.toLocaleString()}${c.reset}`));
  lines.push(line("Currency",  `${c.yellow}🪙 Void Coins${c.reset}`));
  lines.push("");

  // Commands section
  lines.push(`  ${c.purple}┌─${c.reset} ${c.yellow}${c.bold}📋 Command Categories${c.reset}`);
  lines.push(line("🎭 Fun",      "/meme /anime /joke /quote /pickup /roast /bored"));
  lines.push(line("🎮 Games",    "/trivia /wyr /coinflip /guess /gamble"));
  lines.push(line("🪙 Economy",  "/balance /daily /work /beg /deposit /withdraw"));
  lines.push(line("🏪 Shop",     "/shop /buy /sell /inventory /lootbox /trade"));
  lines.push(line("🏆 Ranks",    "/leaderboard /help"));
  lines.push("");

  // Invite section
  lines.push(`  ${c.purple}┌─${c.reset} ${c.yellow}${c.bold}🔗 Invite Link${c.reset}`);
  lines.push(`  ${c.purple}│${c.reset}  ${c.cyan}${inviteUrl}${c.reset}`);
  lines.push("");

  // Required permissions
  lines.push(`  ${c.purple}┌─${c.reset} ${c.yellow}${c.bold}🔐 Required Permissions${c.reset}`);
  const perms = [
    "View Channels", "Send Messages", "Embed Links",
    "Attach Files", "Add Reactions", "Use External Emojis",
    "Read Message History", "Manage Messages",
  ];
  const half = Math.ceil(perms.length / 2);
  for (let i = 0; i < half; i++) {
    const left  = `${c.green}✓${c.reset} ${perms[i]}`;
    const right = perms[i + half] ? `    ${c.green}✓${c.reset} ${perms[i + half]}` : "";
    lines.push(`  ${c.purple}│${c.reset}  ${left}${right}`);
  }
  lines.push("");

  lines.push(`  ${c.pink}${c.bold}${"━".repeat(48)}${c.reset}`);
  lines.push(`  ${c.gray}  Status: ${c.green}${c.bold}● ONLINE${c.reset}${c.gray}  |  Prefix: ${c.cyan}Slash Commands (/)${c.reset}${c.gray}  |  v1.0.0${c.reset}`);
  lines.push(`  ${c.pink}${c.bold}${"━".repeat(48)}${c.reset}`);
  lines.push("");

  console.log(lines.join("\n"));
}
