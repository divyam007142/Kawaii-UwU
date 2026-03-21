import { Client, ActivityType, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import path from "path";
import { initDb } from "../utils/db.js";
import { printBanner } from "../utils/banner.js";
import { startAnimeDrop } from "../utils/animeDrop.js";
import { setupAppEmojis } from "../utils/appEmojis.js";

export const name = "clientReady";
export const once = true;

const STATUSES = [
  { text: "🌸 /help for commands~ ♡",              type: ActivityType.Listening  },
  { text: "🪙 collecting Void Coins~",              type: ActivityType.Playing    },
  { text: "📺 anime all day uwu",                  type: ActivityType.Watching   },
  { text: "🎰 spinning the kawaii slots~",          type: ActivityType.Playing    },
  { text: "✨ ur daily reward awaits~ ♡",           type: ActivityType.Playing    },
  { text: "🎀 being cute, as always (◕ᴗ◕✿)",       type: ActivityType.Playing    },
  { text: "📦 opening loot boxes~ hehe",            type: ActivityType.Playing    },
  { text: "🌀 floating through the void~",          type: ActivityType.Watching   },
  { text: "🧠 trivia time~ wanna play?",            type: ActivityType.Playing    },
  { text: "💕 spreading kawaii energy~",            type: ActivityType.Playing    },
  { text: "🍒 hug • pat • kiss • /anime ♡",        type: ActivityType.Listening  },
  { text: "🌙 dreaming of Void Coins~",             type: ActivityType.Playing    },
];

export async function execute(client: Client) {
  // Rotating cute status every 20 seconds
  let i = 0;
  const updateStatus = () => {
    const s = STATUSES[i % STATUSES.length];
    client.user?.setActivity(s.text, { type: s.type });
    i++;
  };
  updateStatus();
  setInterval(updateStatus, 20000);

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
      const files = readdirSync(dir).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
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

  // Start hourly anime drop
  startAnimeDrop(client);

  const commandCount = (client as any).commands?.size ?? commands.length;
  const eventCount   = 3;
  printBanner(client, commandCount, eventCount);

  // Upload custom 3D emoji assets (non-blocking)
  setupAppEmojis(client).catch((e) => console.warn("[EMOJI] Background setup error:", e));
}
