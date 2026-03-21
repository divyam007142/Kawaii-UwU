import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { SHOP_ITEMS, RARITY_EMOJI, type Rarity } from "../../utils/shop.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

export const data = new SlashCommandBuilder()
  .setName("shop")
  .setDescription("Browse the Kawaii Void Shop for items, loot boxes and more~! 🏪✨");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  const byRarity = RARITY_ORDER.map((r) => ({
    rarity: r,
    items: SHOP_ITEMS.filter((i) => i.rarity === r),
  }));

  const embed = new EmbedBuilder()
    .setColor(COLORS.economy)
    .setTitle(`${E.shop} Kawaii Void Shop~ ✿`)
    .setDescription(
      `Welcome to the **Kawaii Void Shop**~! (◕ᴗ◕✿)\n` +
      `Find rare items, loot boxes, and anime cards here~!\n\n` +
      `Use \`/buy <item>\` to purchase • \`/sell <item>\` to sell ${E.coin}`
    )
    .setFooter({ text: `${cuteFooter()} • /buy to purchase • /sell to sell` });

  for (const { rarity, items } of byRarity) {
    if (items.length === 0) continue;
    const lines = items.map(
      (i) => `${i.emoji} **${i.name}** — ${E.coin} ${i.price.toLocaleString()}\n> ${i.description}`
    );
    embed.addFields({
      name: `${RARITY_EMOJI[rarity]} ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`,
      value: lines.join("\n"),
    });
  }

  await interaction.reply({ embeds: [embed] });
}
