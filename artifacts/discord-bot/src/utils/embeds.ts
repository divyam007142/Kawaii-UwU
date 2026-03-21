import { EmbedBuilder, ColorResolvable } from "discord.js";

export const COLORS = {
  primary: 0x7c3aed as ColorResolvable,
  success: 0x22c55e as ColorResolvable,
  error:   0xef4444 as ColorResolvable,
  warning: 0xf59e0b as ColorResolvable,
  info:    0x3b82f6 as ColorResolvable,
  economy: 0xfbbf24 as ColorResolvable,
  anime:   0xec4899 as ColorResolvable,
  game:    0x06b6d4 as ColorResolvable,
  kawaii:  0xff79c6 as ColorResolvable,
};

export const CURRENCY      = "🪙 Void Coins";
export const CURRENCY_ICON = "🪙";
export const BOT_NAME      = "Kawaii ✿";

// Rotating cute footer tags
const CUTE_FOOTERS = [
  "✿ Kawaii Bot ♡ stay cute~",
  "♡ made with love & magic ✨",
  "🌸 kawaii desu ne~ (◕‿◕✿)",
  "✨ powered by void energy ♡",
  "🎀 ur doing amazing sweetie ♡",
  "🌙 stay kawaii, always~ ✿",
  "💕 Kawaii Bot • ily bestie ♡",
  "☆ spreading cuteness across servers ☆",
  "🍡 nom nom • Kawaii Bot ✿",
  "ヾ(≧▽≦*)o  Kawaii Bot  ヾ(≧▽≦*)o",
];

export function cuteFooter(): string {
  return CUTE_FOOTERS[Math.floor(Math.random() * CUTE_FOOTERS.length)];
}

export function successEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(`✅ ${title} ♡`)
    .setDescription(description)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();
}

export function errorEmbed(description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle("❌ Oopsie~ !")
    .setDescription(description)
    .setFooter({ text: "✿ Kawaii Bot • don't give up! ♡" });
}

export function economyEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.economy)
    .setTitle(`${CURRENCY_ICON} ${title} ✨`)
    .setDescription(description)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();
}

export function funEmbed(title: string, description: string, imageUrl?: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  if (imageUrl) embed.setImage(imageUrl);
  return embed;
}

export function animeEmbed(title: string, gifUrl: string, description?: string) {
  const embed = new EmbedBuilder()
    .setColor(COLORS.anime)
    .setTitle(title)
    .setImage(gifUrl)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();
  if (description) embed.setDescription(description);
  return embed;
}

export function gameEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.game)
    .setTitle(`🎮 ${title} ☆`)
    .setDescription(description)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();
}

export function kawaiiEmbed(title: string, description: string) {
  return new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();
}
