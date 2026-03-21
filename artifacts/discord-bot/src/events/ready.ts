import { Client, ActivityType, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { writeFile } from "fs/promises";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import { initDb, query } from "../utils/db.js";
import { printBanner, startUptimePrinter } from "../utils/banner.js";
import { startAnimeDrop } from "../utils/animeDrop.js";
import { setupAppEmojis } from "../utils/appEmojis.js";

export const name = "clientReady";
export const once = true;

const STATUSES = [
  { text: "🌸 /help for commands~ ♡",         type: ActivityType.Listening },
  { text: "🪙 collecting Void Coins~",          type: ActivityType.Playing   },
  { text: "📺 anime all day uwu",               type: ActivityType.Watching  },
  { text: "🎰 spinning the kawaii slots~",       type: ActivityType.Playing   },
  { text: "✨ ur daily reward awaits~ ♡",        type: ActivityType.Playing   },
  { text: "🎀 being cute, as always (◕ᴗ◕✿)",    type: ActivityType.Playing   },
  { text: "📦 opening loot boxes~ hehe",         type: ActivityType.Playing   },
  { text: "🌀 floating through the void~",       type: ActivityType.Watching  },
  { text: "🧠 trivia time~ wanna play?",         type: ActivityType.Playing   },
  { text: "💕 spreading kawaii energy~",         type: ActivityType.Playing   },
  { text: "🍒 hug • pat • kiss • /anime ♡",     type: ActivityType.Listening },
  { text: "🌙 dreaming of Void Coins~",          type: ActivityType.Playing   },
];

async function writeStats(client: Client, commandCount: number) {
  try {
    const [usersRow, coinsRow] = await Promise.all([
      query("SELECT COUNT(*) AS count FROM users").catch(() => ({ rows: [{ count: "0" }] })),
      query("SELECT COALESCE(SUM(balance + bank), 0) AS total FROM users").catch(() => ({ rows: [{ total: "0" }] })),
    ]);

    const stats = {
      tag:             client.user?.tag ?? "Kawaii#3339",
      avatar:          client.user?.displayAvatarURL({ size: 256 }) ?? "",
      id:              client.user?.id ?? "",
      servers:         client.guilds.cache.size,
      users:           client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
      uptime:          Math.floor(process.uptime()),
      commands:        commandCount,
      registeredUsers: parseInt(usersRow.rows[0]?.count ?? "0"),
      totalCoins:      parseInt(coinsRow.rows[0]?.total ?? "0"),
      updatedAt:       new Date().toISOString(),
    };

    await writeFile("/tmp/kawaii-stats.json", JSON.stringify(stats));
  } catch { /* silently ignore — non-critical */ }
}

export async function execute(client: Client) {
  // Rotating status every 20 s
  let i = 0;
  const updateStatus = () => {
    const s = STATUSES[i % STATUSES.length];
    client.user?.setActivity(s.text, { type: s.type });
    i++;
  };
  updateStatus();
  setInterval(updateStatus, 20_000);

  // Init DB
  await initDb();

  // Deploy slash commands
  const token    = process.env.DISCORD_BOT_TOKEN!;
  const clientId = process.env.DISCORD_CLIENT_ID!;
  const commands: object[] = [];

  const __dirname   = path.dirname(fileURLToPath(import.meta.url));
  const foldersPath = path.join(__dirname, "..", "commands");

  try {
    const folders = readdirSync(foldersPath);
    for (const folder of folders) {
      const dir   = path.join(foldersPath, folder);
      const files = readdirSync(dir).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
      for (const file of files) {
        const cmd = await import(pathToFileURL(path.join(dir, file)).href);
        if ("data" in cmd && "execute" in cmd) commands.push(cmd.data.toJSON());
      }
    }
    const rest = new REST().setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
  } catch (e) {
    console.error("[BOT] Failed to deploy commands:", e);
  }

  // Start hourly anime drop (aligned to top of hour)
  startAnimeDrop(client);

  const commandCount = (client as any).commands?.size ?? commands.length;
  const eventCount   = 3;
  printBanner(client, commandCount, eventCount);

  // Live uptime line every minute
  startUptimePrinter(client);

  // Write stats immediately + refresh every minute (for dashboard)
  writeStats(client, commandCount);
  setInterval(() => writeStats(client, commandCount), 60_000);

  // Upload custom emoji assets (non-blocking)
  setupAppEmojis(client).catch(e => console.warn("[EMOJI] Background setup error:", e));
}
