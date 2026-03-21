import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, addXp, query } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

const JOBS = [
  { name: "Meme Designer",          min: 80,  max: 200, emoji: "🎨" },
  { name: "Anime Reviewer",         min: 100, max: 250, emoji: "📺" },
  { name: "Void Miner",             min: 120, max: 300, emoji: "⛏️" },
  { name: "Kawaii Artist",          min: 90,  max: 230, emoji: "🌸" },
  { name: "Discord Moderator",      min: 60,  max: 180, emoji: "🛡️" },
  { name: "Loot Box Appraiser",     min: 90,  max: 220, emoji: "📦" },
  { name: "Crypto Analyst",         min: 150, max: 350, emoji: "📈" },
  { name: "Bot Developer",          min: 200, max: 400, emoji: "🤖" },
  { name: "Twitch Streamer",        min: 50,  max: 500, emoji: "🎮" },
  { name: "NFT Artist",             min: 10,  max: 600, emoji: "🖼️" },
  { name: "Void Energy Collector",  min: 100, max: 280, emoji: "🌀" },
  { name: "Cute Sticker Designer",  min: 80,  max: 210, emoji: "🎀" },
];

const MESSAGES = [
  (job: string, earned: number, c: string) => `You worked hard as a **${job}** and earned **${earned}** ${c}~ ♡`,
  (job: string, earned: number, c: string) => `Your boss was impressed!! You got **${earned}** ${c} as a **${job}**~ ✨`,
  (job: string, earned: number, c: string) => `Another day as a **${job}**~ and you banked **${earned}** ${c}!! ✿`,
  (job: string, earned: number, c: string) => `The void recognized your effort as a **${job}**! Here's **${earned}** ${c} ♡`,
  (job: string, earned: number, c: string) => `You hustled all day as a **${job}**!! **${earned}** ${c} well earned~ 🌸`,
];

const WORK_COOLDOWN_MS = 3600000;

export const data = new SlashCommandBuilder()
  .setName("work")
  .setDescription("Work at a random job to earn Void Coins~! 💼✨ (1h cooldown)");

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  const user     = await getUser(interaction.user.id, interaction.user.username);
  const now      = new Date();
  const lastWork = user.last_work ? new Date(user.last_work) : null;

  if (lastWork) {
    const elapsed = now.getTime() - lastWork.getTime();
    if (elapsed < WORK_COOLDOWN_MS) {
      const mins = Math.ceil((WORK_COOLDOWN_MS - elapsed) / 60000);
      await interaction.reply({
        embeds: [errorEmbed(`You're tired~ rest a little! 😴\nCome back in **${mins} minutes** ♡`)],
        ephemeral: true,
      });
      return;
    }
  }

  const job    = JOBS[Math.floor(Math.random() * JOBS.length)];
  const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
  const msgFn  = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  await query("UPDATE users SET balance = balance + $1, last_work = NOW() WHERE user_id = $2", [earned, interaction.user.id]);
  await addXp(interaction.user.id, 20);

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(`${E.work} Work Complete~!! ♡`)
    .setDescription(
      msgFn(job.name, earned, E.coin) +
      `\n\n${E.star} **+20 XP** earned too~! ✿`
    )
    .addFields({ name: `⏰ Next Work`, value: "In **1 hour** ♡", inline: true })
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
