import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { query } from "../../utils/db.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";
import { createLeaderboardBanner } from "../../utils/canvas.js";

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

const RANK_STYLES = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const type = interaction.options.getString("type") ?? "wealth";

  let orderBy: string, title: string, color: number, valueLabel: (row: any) => string;

  if (type === "xp") {
    orderBy    = "xp DESC";
    title      = `${E.star} XP Leaderboard`;
    color      = 0x60a5fa;
    valueLabel = (r) => `Level **${r.level}** • ${parseInt(r.xp).toLocaleString()} XP ${E.sparkle}`;
  } else if (type === "streak") {
    orderBy    = "daily_streak DESC";
    title      = `${E.fire} Streak Leaderboard`;
    color      = 0xf97316;
    valueLabel = (r) => `**${r.daily_streak}** day streak~ ♡`;
  } else {
    orderBy    = "(balance + bank) DESC";
    title      = `${E.trophy} Wealth Leaderboard`;
    color      = 0xfbbf24;
    valueLabel = (r) => `**${(parseInt(r.balance) + parseInt(r.bank)).toLocaleString()}** ${E.coin}`;
  }

  const [res, bannerBuffer] = await Promise.all([
    query(`SELECT user_id, username, balance, bank, xp, level, daily_streak FROM users ORDER BY ${orderBy} LIMIT 10`),
    createLeaderboardBanner(type),
  ]);

  const attachment = new AttachmentBuilder(bannerBuffer, { name: "leaderboard-banner.png" });

  const lines = res.rows.map(
    (row: any, i: number) => `${RANK_STYLES[i]} **${row.username}** — ${valueLabel(row)}`
  );

  const embed = new EmbedBuilder()
    .setColor(color as any)
    .setTitle(`${title}~ ✿`)
    .setDescription(
      lines.length > 0
        ? lines.join("\n")
        : `No users yet~! Be the first!! ${E.crown}`
    )
    .setImage("attachment://leaderboard-banner.png")
    .setThumbnail(interaction.client.user?.displayAvatarURL() ?? null)
    .setFooter({ text: `${cuteFooter()} • updated just now~ ♡` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed], files: [attachment] });
}
