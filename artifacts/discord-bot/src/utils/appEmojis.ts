import { Client } from "discord.js";
import axios from "axios";

// ── Fallback Unicode emojis (used until app emojis load) ──────────────────────
export const E: Record<string, string> = {
  coin:    "🪙",
  gem:     "💎",
  bag:     "💰",
  bank:    "🏛️",
  fire:    "🔥",
  star:    "⭐",
  crown:   "👑",
  box:     "📦",
  cart:    "🛒",
  pack:    "🎒",
  cash:    "💸",
  trophy:  "🏆",
  work:    "🔨",
  slots:   "🎰",
  chart:   "📊",
  heart:   "💕",
  sparkle: "✨",
  shop:    "🏪",
  trade:   "🤝",
  daily:   "📅",
};

const BASE = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

const EMOJI_SOURCES: { key: string; name: string; url: string }[] = [
  { key: "coin",   name: "kw_coin",   url: `${BASE}/Coin/3D/coin_3d.png`                             },
  { key: "gem",    name: "kw_gem",    url: `${BASE}/Gem%20stone/3D/gem_stone_3d.png`                 },
  { key: "bag",    name: "kw_bag",    url: `${BASE}/Money%20bag/3D/money_bag_3d.png`                 },
  { key: "bank",   name: "kw_bank",   url: `${BASE}/Classical%20building/3D/classical_building_3d.png` },
  { key: "fire",   name: "kw_fire",   url: `${BASE}/Fire/3D/fire_3d.png`                             },
  { key: "star",   name: "kw_star",   url: `${BASE}/Star/3D/star_3d.png`                             },
  { key: "crown",  name: "kw_crown",  url: `${BASE}/Crown/3D/crown_3d.png`                           },
  { key: "box",    name: "kw_box",    url: `${BASE}/Package/3D/package_3d.png`                       },
  { key: "cart",   name: "kw_cart",   url: `${BASE}/Shopping%20cart/3D/shopping_cart_3d.png`         },
  { key: "pack",   name: "kw_pack",   url: `${BASE}/Backpack/3D/backpack_3d.png`                     },
  { key: "cash",   name: "kw_cash",   url: `${BASE}/Money%20with%20wings/3D/money_with_wings_3d.png` },
  { key: "trophy", name: "kw_trophy", url: `${BASE}/Trophy/3D/trophy_3d.png`                         },
  { key: "work",   name: "kw_work",   url: `${BASE}/Hammer%20and%20wrench/3D/hammer_and_wrench_3d.png` },
  { key: "slots",  name: "kw_slots",  url: `${BASE}/Slot%20machine/3D/slot_machine_3d.png`           },
  { key: "chart",  name: "kw_chart",  url: `${BASE}/Bar%20chart/3D/bar_chart_3d.png`                 },
  { key: "heart",  name: "kw_heart",  url: `${BASE}/Sparkling%20heart/3D/sparkling_heart_3d.png`     },
  { key: "shop",   name: "kw_shop",   url: `${BASE}/Convenience%20store/3D/convenience_store_3d.png` },
  { key: "trade",  name: "kw_trade",  url: `${BASE}/Handshake/3D/handshake_3d.png`                   },
  { key: "daily",  name: "kw_daily",  url: `${BASE}/Calendar/3D/calendar_3d.png`                     },
];

let emojisReady = false;

export function areEmojisReady() { return emojisReady; }

export async function setupAppEmojis(client: Client): Promise<void> {
  try {
    if (!client.application) await client.application?.fetch();

    const existing = await client.application?.emojis.fetch();

    let uploaded = 0;
    let reused   = 0;

    for (const { key, name, url } of EMOJI_SOURCES) {
      try {
        const found = existing?.find((e) => e.name === name);
        if (found) {
          E[key] = `<:${found.name}:${found.id}>`;
          reused++;
          continue;
        }

        const res   = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
        const emoji = await client.application?.emojis.create({
          attachment: Buffer.from(res.data),
          name,
        });

        if (emoji) {
          E[key] = `<:${emoji.name}:${emoji.id}>`;
          uploaded++;
          console.log(`[EMOJI] ✓ Uploaded ${name}`);
        }

        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 600));
      } catch (err: any) {
        console.warn(`[EMOJI] ✗ Failed ${name}: ${err?.message ?? err}`);
      }
    }

    emojisReady = true;
    console.log(`[EMOJI] Ready — ${uploaded} uploaded, ${reused} reused`);
  } catch (err: any) {
    console.warn("[EMOJI] Setup failed, using Unicode fallbacks:", err?.message ?? err);
  }
}
