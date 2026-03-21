import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { getUser, addXp } from "../../utils/db.js";
import { query } from "../../utils/db.js";

export const data = new SlashCommandBuilder()
  .setName("coinflip")
  .setDescription("Pick heads or tails, place your bet, and let the void decide~! 🪙✨")
  .addStringOption((opt) =>
    opt.setName("choice")
      .setDescription("Will fortune favour you? Choose wisely~! ✿")
      .setRequired(true)
      .addChoices(
        { name: "🔵 Heads", value: "heads" },
        { name: "🔴 Tails", value: "tails" }
      )
  )
  .addIntegerOption((opt) =>
    opt.setName("amount")
      .setDescription("How many Void Coins to bet (minimum: 10)")
      .setRequired(true)
      .setMinValue(10)
  );

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  const choice = interaction.options.getString("choice", true);
  const amount = interaction.options.getInteger("amount", true);

  const user = await getUser(interaction.user.id, interaction.user.username);
  if (parseInt(user.balance) < amount) {
    await interaction.reply({
      embeds: [errorEmbed(`You don't have enough Void Coins~! You have **${parseInt(user.balance).toLocaleString()}** 🪙 ♡`)],
      ephemeral: true,
    });
    return;
  }

  const result = Math.random() < 0.5 ? "heads" : "tails";
  const won    = choice === result;
  const change = won ? amount : -amount;

  await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [change, interaction.user.id]);
  if (won) await addXp(interaction.user.id, 10);

  const newBalance  = parseInt(user.balance) + change;
  const resultEmoji = result === "heads" ? "🔵" : "🔴";

  const embed = new EmbedBuilder()
    .setColor(won ? COLORS.success : COLORS.error)
    .setTitle(`${resultEmoji} Coin Flip~!! ✿`)
    .setDescription(
      `The coin landed on **${result.toUpperCase()}**!\n\n` +
      `Your choice: **${choice.toUpperCase()}**\n` +
      `${won
        ? `✅ You won **${amount.toLocaleString()}** 🪙~!! ♡ Lucky~!`
        : `❌ You lost **${amount.toLocaleString()}** 🪙~ aww!! ♡`
      }\n\n` +
      `💰 New Balance: **${newBalance.toLocaleString()}** 🪙`
    )
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
