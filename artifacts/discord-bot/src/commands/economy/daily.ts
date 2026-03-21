import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, addXp, query } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

const BASE_REWARD      = 500;
const STREAK_BONUS     = 50;
const MAX_STREAK_BONUS = 2000;

export const data = new SlashCommandBuilder()
  .setName("daily")
  .setDescription("Claim your daily Void Coins and streak bonus~! 📅♡");

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  const user = await getUser(interaction.user.id, interaction.user.username);
  const now  = new Date();
  const lastDaily = user.last_daily ? new Date(user.last_daily) : null;

  if (lastDaily) {
    const hoursSince = (now.getTime() - lastDaily.getTime()) / 3600000;
    if (hoursSince < 20) {
      const nextDaily  = new Date(lastDaily.getTime() + 20 * 3600000);
      const timeLeft   = nextDaily.getTime() - now.getTime();
      const hoursLeft  = Math.floor(timeLeft / 3600000);
      const minsLeft   = Math.floor((timeLeft % 3600000) / 60000);
      await interaction.reply({
        embeds: [errorEmbed(`Already claimed today~! ${E.heart}\n\n⏰ Next daily in **${hoursLeft}h ${minsLeft}m** ♡`)],
        ephemeral: true,
      });
      return;
    }
  }

  let newStreak = 1;
  if (lastDaily) {
    const hoursSince = (now.getTime() - lastDaily.getTime()) / 3600000;
    if (hoursSince < 48) newStreak = (user.daily_streak || 0) + 1;
  }

  const streakBonus  = Math.min(newStreak * STREAK_BONUS, MAX_STREAK_BONUS);
  const totalReward  = BASE_REWARD + streakBonus;

  await query(
    "UPDATE users SET balance = balance + $1, daily_streak = $2, last_daily = NOW() WHERE user_id = $3",
    [totalReward, newStreak, interaction.user.id]
  );
  await addXp(interaction.user.id, 50);

  const streakEmoji =
    newStreak >= 30 ? E.crown :
    newStreak >= 14 ? E.fire  :
    newStreak >= 7  ? E.star  : E.heart;

  const milestoneMsg =
    newStreak === 7  ? `\n\n${E.sparkle} **7-Day Streak!!** You're on fire~!! ♡`         :
    newStreak === 14 ? `\n\n${E.fire} **14-Day Streak!!** Absolutely legendary!! ヾ(≧▽≦*)o` :
    newStreak === 30 ? `\n\n${E.crown} **30-Day Streak!!** YOU ARE THE KAWAII MASTER~!! ♡✿` : "";

  const name = interaction.user.displayName ?? interaction.user.username;

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(`${E.daily} Daily Reward Claimed~!! ♡`)
    .setDescription(
      `Heyy **${name}**~! Here's your daily gift!! (◕ᴗ◕✿)\n\n` +
      `${E.box} Base Reward: **${BASE_REWARD.toLocaleString()}** ${E.coin}\n` +
      `${streakEmoji} Streak Bonus: **+${streakBonus.toLocaleString()}** ${E.coin} *(Day **${newStreak}** ✿)*\n` +
      `${E.gem} Total: **${totalReward.toLocaleString()}** ${E.coin}\n` +
      `${E.star} XP: **+50 XP**` +
      milestoneMsg
    )
    .addFields({ name: `${E.fire} Current Streak`, value: `**${newStreak} days** ♡`, inline: true })
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
