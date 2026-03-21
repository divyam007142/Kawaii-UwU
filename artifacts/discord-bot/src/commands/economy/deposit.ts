import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, query } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("deposit")
  .setDescription("Deposit Void Coins into your bank for safe keeping~! 🏛️♡")
  .addStringOption((opt) =>
    opt.setName("amount").setDescription('Amount to deposit — or type "all" ✿').setRequired(true)
  );

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  const user       = await getUser(interaction.user.id, interaction.user.username);
  const balance    = parseInt(user.balance);
  const amountStr  = interaction.options.getString("amount", true).toLowerCase();

  let amount: number;
  if (amountStr === "all") {
    amount = balance;
  } else {
    amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      await interaction.reply({ embeds: [errorEmbed(`Enter a valid amount or "all" to deposit everything~ ♡`)], ephemeral: true });
      return;
    }
  }

  if (amount > balance) {
    await interaction.reply({ embeds: [errorEmbed(`You only have **${balance.toLocaleString()}** ${E.coin} in your wallet sweetie~ ♡`)], ephemeral: true });
    return;
  }

  await query("UPDATE users SET balance = balance - $1, bank = bank + $1 WHERE user_id = $2", [amount, interaction.user.id]);

  const embed = new EmbedBuilder()
    .setColor(COLORS.economy)
    .setTitle(`${E.bank} Deposit Successful~!! ♡`)
    .setDescription(
      `Safely tucked **${amount.toLocaleString()}** ${E.coin} into your bank~!\n\n` +
      `${E.coin} Wallet: **${(balance - amount).toLocaleString()}** ${E.coin}\n` +
      `${E.bank} Bank: **${(parseInt(user.bank) + amount).toLocaleString()}** ${E.coin}`
    )
    .setFooter({ text: cuteFooter() });

  await interaction.reply({ embeds: [embed] });
}
