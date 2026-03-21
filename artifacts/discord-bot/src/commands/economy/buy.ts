import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, addItem, query } from "../../utils/db.js";
import { SHOP_ITEMS, getItem, RARITY_EMOJI } from "../../utils/shop.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("buy")
  .setDescription("Purchase an item from the Kawaii Void Shop~! 🛒♡")
  .addStringOption((opt) =>
    opt.setName("item").setDescription("Search for an item to buy ✿").setRequired(true).setAutocomplete(true)
  )
  .addIntegerOption((opt) =>
    opt.setName("quantity").setDescription("How many to buy (max 10)").setMinValue(1).setMaxValue(10)
  );

export const cooldown = 3;

export async function autocomplete(interaction: any) {
  const focused  = interaction.options.getFocused().toLowerCase();
  const choices  = SHOP_ITEMS
    .filter((i) => i.name.toLowerCase().includes(focused) || i.id.includes(focused))
    .slice(0, 25)
    .map((i) => ({ name: `${i.emoji} ${i.name} — ${i.price.toLocaleString()} coins`, value: i.id }));
  await interaction.respond(choices);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const itemId    = interaction.options.getString("item", true);
  const qty       = interaction.options.getInteger("quantity") ?? 1;
  const item      = getItem(itemId);

  if (!item) {
    await interaction.reply({ embeds: [errorEmbed(`That item doesn't exist~ Check \`/shop\` ♡`)], ephemeral: true });
    return;
  }

  const totalCost = item.price * qty;
  const user      = await getUser(interaction.user.id, interaction.user.username);

  if (parseInt(user.balance) < totalCost) {
    await interaction.reply({
      embeds: [errorEmbed(`You need **${totalCost.toLocaleString()}** ${E.coin} but only have **${parseInt(user.balance).toLocaleString()}** ${E.coin}~ Save up!! ♡`)],
      ephemeral: true,
    });
    return;
  }

  await query("UPDATE users SET balance = balance - $1 WHERE user_id = $2", [totalCost, interaction.user.id]);
  await addItem(interaction.user.id, item.id, qty);

  const embed = new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle(`${E.cart} Purchase Complete~!! ♡`)
    .setDescription(
      `You bought **${qty}x ${item.emoji} ${item.name}** ${RARITY_EMOJI[item.rarity]}~!\n\n` +
      `${E.cash} Spent: **${totalCost.toLocaleString()}** ${E.coin}\n` +
      `${E.coin} Remaining: **${(parseInt(user.balance) - totalCost).toLocaleString()}** ${E.coin}`
    )
    .setFooter({ text: `${cuteFooter()} • /inventory to view your items ♡` });

  await interaction.reply({ embeds: [embed] });
}
