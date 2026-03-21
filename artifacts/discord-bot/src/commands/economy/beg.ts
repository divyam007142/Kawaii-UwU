import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, addXp, query } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

const BEG_COOLDOWN_MS = 300000;
const SUCCESS_CHANCE  = 0.7;

const SUCCESS_MSGS = [
  "A generous stranger felt your kawaii energy and donated~! ♡",
  "Kawaii Bot felt sorry and tossed you some coins~ 🌸",
  "Someone dropped their wallet and you... found it. uwu",
  "A rich user donated to your poverty fund~ ✿",
  "The void economy took pity on you!! ヾ(≧▽≦*)o",
  "Your begging face was too cute to ignore~ 🎀",
];

const FAIL_MSGS = [
  "Nobody wants to give you money~ Try /work instead!!",
  "You begged for 10 minutes and got nothing. Skill issue~ 😭",
  "A user walked past and said 'get a job'.",
  "Even the void is broke right now.",
  "Your cuteness wasn't enough this time~ (｡•́︿•̀｡)",
];

export const data = new SlashCommandBuilder()
  .setName("beg")
  .setDescription("Beg for Void Coins~ it's shameless but sometimes it works! 🙏✨ (5m cooldown)");

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  const user    = await getUser(interaction.user.id, interaction.user.username);
  const now     = new Date();
  const lastBeg = user.last_beg ? new Date(user.last_beg) : null;

  if (lastBeg) {
    const elapsed = now.getTime() - lastBeg.getTime();
    if (elapsed < BEG_COOLDOWN_MS) {
      const remaining = Math.ceil((BEG_COOLDOWN_MS - elapsed) / 1000);
      await interaction.reply({
        embeds: [errorEmbed(`You begged too recently~! Wait **${remaining}s** before begging again ♡`)],
        ephemeral: true,
      });
      return;
    }
  }

  await query("UPDATE users SET last_beg = NOW() WHERE user_id = $1", [interaction.user.id]);

  if (Math.random() < SUCCESS_CHANCE) {
    const earned = Math.floor(Math.random() * 91) + 10;
    await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [earned, interaction.user.id]);
    await addXp(interaction.user.id, 5);

    const msg = SUCCESS_MSGS[Math.floor(Math.random() * SUCCESS_MSGS.length)];
    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle(`${E.heart} Someone Showed Mercy~!! ♡`)
      .setDescription(`${msg}\n\nYou received **${earned}** ${E.coin} + ${E.star} **5 XP**~ ✨`)
      .setFooter({ text: cuteFooter() });
    await interaction.reply({ embeds: [embed] });
  } else {
    const msg = FAIL_MSGS[Math.floor(Math.random() * FAIL_MSGS.length)];
    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle(`😔 Nobody Cares~ ♡`)
      .setDescription(msg)
      .setFooter({ text: cuteFooter() });
    await interaction.reply({ embeds: [embed] });
  }
}
