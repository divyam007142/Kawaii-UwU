import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getInventory, removeItem, query } from "../../utils/db.js";
import { getItem } from "../../utils/shop.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("sell")
  .setDescription("Sell items from your inventory for Void Coins~! 💱✨")
  .addStringOption((opt) =>
    opt.setName("item").setDescription("Pick an item from your inventory to sell ✿").setRequired(true).setAutocomplete(true)
  )
  .addIntegerOption((opt) =>
    opt.setName("quantity").setDescription("How many to sell (default 1)").setMinValue(1)
  );

export const cooldown = 3;

export async function autocomplete(interaction: any) {
  const inventory = await getInventory(interaction.user.id);
  const focused   = interaction.options.getFocused().toLowerCase();
  const choices   = inventory
    .map((inv: any) => {
      const item = getItem(inv.item_id);
      if (!item) return null;
      return { name: `${item.emoji} ${item.name} (x${inv.quantity}) — sell: ${item.sellPrice} coins`, value: item.id };
    })
    .filter(Boolean)
    .filter((c: any) => c.name.toLowerCase().includes(focused))
    .slice(0, 25);
  await interaction.respond(choices);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId = interaction.options.getString("item", true);
  const qty    = interaction.options.getInteger("quantity") ?? 1;
  const item   = getItem(itemId);

  if (!item) {
    await interaction.reply({ embeds: [errorEmbed(`That item doesn't exist in the shop~ ♡`)], ephemeral: true });
    return;
  }

  const removed = await removeItem(interaction.user.id, item.id, qty);
  if (!removed) {
    await interaction.reply({ embeds: [errorEmbed(`You don't have **${qty}x ${item.emoji} ${item.name}** in your inventory~ ♡`)], ephemeral: true });
    return;
  }

  const totalEarned = item.sellPrice * qty;
  await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [totalEarned, interaction.user.id]);

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(`${E.cash} Item Sold~!! ✿`)
    .setDescription(
      `Sold **${qty}x ${item.emoji} ${item.name}** for **${totalEarned.toLocaleString()}** ${E.coin}~! ♡\n\n` +
      `Browse \`/shop\` to find more treasures~ 🌸`
    )
    .setFooter({ text: cuteFooter() });

  await interaction.reply({ embeds: [embed] });
}
