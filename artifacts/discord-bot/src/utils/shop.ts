export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  sellPrice: number;
  rarity: Rarity;
  type: "food" | "tool" | "lootbox" | "card" | "upgrade";
  effect?: string;
}

export const RARITY_COLORS: Record<Rarity, number> = {
  common: 0x9ca3af,
  rare: 0x3b82f6,
  epic: 0x8b5cf6,
  legendary: 0xf59e0b,
};

export const RARITY_EMOJI: Record<Rarity, string> = {
  common: "⚪",
  rare: "🔵",
  epic: "🟣",
  legendary: "🟡",
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    description: "A crisp apple. A healthy snack for the void.",
    price: 50,
    sellPrice: 25,
    rarity: "common",
    type: "food",
    effect: "Restore 10 XP",
  },
  {
    id: "ramen",
    name: "Ramen Bowl",
    emoji: "🍜",
    description: "A steaming bowl of void ramen. Delicious.",
    price: 150,
    sellPrice: 75,
    rarity: "common",
    type: "food",
    effect: "Restore 30 XP",
  },
  {
    id: "pickaxe",
    name: "Void Pickaxe",
    emoji: "⛏️",
    description: "Boosts your work earnings by 10% for 1 hour.",
    price: 500,
    sellPrice: 250,
    rarity: "rare",
    type: "tool",
    effect: "+10% work earnings",
  },
  {
    id: "laptop",
    name: "Hacker Laptop",
    emoji: "💻",
    description: "High-tech equipment. Boosts work earnings significantly.",
    price: 2000,
    sellPrice: 1000,
    rarity: "epic",
    type: "tool",
    effect: "+25% work earnings",
  },
  {
    id: "lootbox_common",
    name: "Common Loot Box",
    emoji: "📦",
    description: "Contains random rewards. Common tier.",
    price: 300,
    sellPrice: 100,
    rarity: "common",
    type: "lootbox",
  },
  {
    id: "lootbox_rare",
    name: "Rare Loot Box",
    emoji: "🎁",
    description: "Contains better rewards. Rare tier.",
    price: 1500,
    sellPrice: 500,
    rarity: "rare",
    type: "lootbox",
  },
  {
    id: "lootbox_legendary",
    name: "Legendary Loot Box",
    emoji: "👑",
    description: "The ultimate loot box. Legendary rewards inside!",
    price: 10000,
    sellPrice: 4000,
    rarity: "legendary",
    type: "lootbox",
  },
  {
    id: "anime_card_common",
    name: "Common Anime Card",
    emoji: "🃏",
    description: "A random common anime character card.",
    price: 200,
    sellPrice: 80,
    rarity: "common",
    type: "card",
  },
  {
    id: "anime_card_rare",
    name: "Rare Anime Card",
    emoji: "✨",
    description: "A rare anime character card. Very collectible!",
    price: 800,
    sellPrice: 400,
    rarity: "rare",
    type: "card",
  },
  {
    id: "anime_card_legendary",
    name: "Legendary Anime Card",
    emoji: "🌟",
    description: "An ultra-rare legendary character card!",
    price: 5000,
    sellPrice: 2500,
    rarity: "legendary",
    type: "card",
  },
  {
    id: "void_crystal",
    name: "Void Crystal",
    emoji: "💎",
    description: "Mysterious crystal from the void. Worth a lot.",
    price: 3000,
    sellPrice: 2000,
    rarity: "epic",
    type: "upgrade",
  },
  {
    id: "void_essence",
    name: "Void Essence",
    emoji: "🌀",
    description: "Pure concentrated void energy. Legendary rarity.",
    price: 20000,
    sellPrice: 10000,
    rarity: "legendary",
    type: "upgrade",
    effect: "+50% all earnings for 24h",
  },
];

export function getItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

export const LOOT_BOX_REWARDS: Record<string, { coins: [number, number]; items: string[] }> = {
  lootbox_common: {
    coins: [100, 500],
    items: ["apple", "ramen", "anime_card_common"],
  },
  lootbox_rare: {
    coins: [500, 2000],
    items: ["pickaxe", "anime_card_rare", "void_crystal", "lootbox_common"],
  },
  lootbox_legendary: {
    coins: [2000, 15000],
    items: ["laptop", "anime_card_legendary", "void_essence", "lootbox_rare"],
  },
};

export function openLootBox(boxId: string): { coins: number; item: ShopItem | null } {
  const rewards = LOOT_BOX_REWARDS[boxId];
  if (!rewards) return { coins: 0, item: null };

  const coins =
    Math.floor(Math.random() * (rewards.coins[1] - rewards.coins[0] + 1)) +
    rewards.coins[0];

  const itemId = rewards.items[Math.floor(Math.random() * rewards.items.length)];
  const item = getItem(itemId) ?? null;

  return { coins, item };
}
