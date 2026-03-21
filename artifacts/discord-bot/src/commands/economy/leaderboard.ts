import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { query } from "../../utils/db.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("See the richest, highest XP, and longest streak users in the void~! 🏆✨")
  .addStringOption((opt) =>
    opt.setName("type").setDescription("What ranking to view ✿")
      .addChoices(
        { name: "💰 Richest Users",  value: "wealth" },
        { name: "⭐ Highest XP",     value: "xp"     },
        { name: "🔥 Longest Streak", value: "streak" }
      )
  );

export const cooldown = 10;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const type = interaction.options.getString("type") ?? "wealth";

  let orderBy: string, title: string, valueLabel: (row: any) => string;

  if (type === "xp") {
    orderBy    = "xp DESC";
    title      = `${E.star} XP Leaderboard`;
    valueLabel = (r) => `Level **${r.level}** • ${parseInt(r.xp).toLocaleString()} XP ${E.sparkle}`;
  } else if (type === "streak") {
    orderBy    = "daily_streak DESC";
    title      = `${E.fire} Streak Leaderboard`;
    valueLabel = (r) => `**${r.daily_streak}** day streak~ ♡`;
  } else {
    orderBy    = "(balance + bank) DESC";
    title      = `${E.trophy} Wealth Leaderboard`;
    valueLabel = (r) => `**${(parseInt(r.balance) + parseInt(r.bank)).toLocaleString()}** ${E.coin}`;
  }

  const res    = await query(`SELECT user_id, username, balance, bank, xp, level, daily_streak FROM users ORDER BY ${orderBy} LIMIT 10`);
  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  const lines  = res.rows.map(
    (row: any, i: number) => `${medals[i]} **${row.username}** — ${valueLabel(row)}`
  );

  const embed = new EmbedBuilder()
    .setColor(COLORS.economy)
    .setTitle(`${title}~ ✿`)
    .setDescription(lines.length > 0 ? lines.join("\n") : `No users yet~! Be the first!! ${E.crown}`)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
