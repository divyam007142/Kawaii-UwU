import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, query } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("withdraw")
  .setDescription("Withdraw Void Coins from your bank into your wallet~! 💸♡")
  .addStringOption((opt) =>
    opt.setName("amount").setDescription('Amount to withdraw — or type "all" ✿').setRequired(true)
  );

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  const user      = await getUser(interaction.user.id, interaction.user.username);
  const bank      = parseInt(user.bank);
  const amountStr = interaction.options.getString("amount", true).toLowerCase();

  let amount: number;
  if (amountStr === "all") {
    amount = bank;
  } else {
    amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      await interaction.reply({ embeds: [errorEmbed(`Enter a valid amount or "all" to withdraw everything~ ♡`)], ephemeral: true });
      return;
    }
  }

  if (amount > bank) {
    await interaction.reply({ embeds: [errorEmbed(`You only have **${bank.toLocaleString()}** ${E.coin} in the bank sweetie~ ♡`)], ephemeral: true });
    return;
  }

  await query("UPDATE users SET bank = bank - $1, balance = balance + $1 WHERE user_id = $2", [amount, interaction.user.id]);

  const embed = new EmbedBuilder()
    .setColor(COLORS.economy)
    .setTitle(`${E.cash} Withdrawal Successful~!! ♡`)
    .setDescription(
      `Grabbed **${amount.toLocaleString()}** ${E.coin} from the bank~!\n\n` +
      `${E.coin} Wallet: **${(parseInt(user.balance) + amount).toLocaleString()}** ${E.coin}\n` +
      `${E.bank} Bank: **${(bank - amount).toLocaleString()}** ${E.coin}`
    )
    .setFooter({ text: cuteFooter() });

  await interaction.reply({ embeds: [embed] });
}
