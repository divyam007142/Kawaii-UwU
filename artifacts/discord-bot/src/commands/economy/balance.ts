import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser } from "../../utils/db.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("balance")
  .setDescription("Check your Void Coin balance, XP progress and streak~! 💰♡")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("Check another user's balance ✿").setRequired(false)
  );

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user") ?? interaction.user;
  const user   = await getUser(target.id, target.username);

  const total    = parseInt(user.balance) + parseInt(user.bank);
  const xpNeeded = Math.pow((user.level) / 0.1, 2);
  const xpNow    = parseInt(user.xp);
  const progress = Math.min(Math.floor((xpNow / xpNeeded) * 10), 10);
  const bar      = "█".repeat(progress) + "░".repeat(10 - progress);

  const name = target.displayName ?? target.username;

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(`${E.bag} ${name}'s Wallet~ ♡`)
    .setThumbnail(target.displayAvatarURL())
    .setDescription(`*Void wealth of **${name}**~!* ✿`)
    .addFields(
      { name: `${E.coin} Wallet`,      value: `**${parseInt(user.balance).toLocaleString()}** ${E.coin}`, inline: true },
      { name: `${E.bank} Bank`,        value: `**${parseInt(user.bank).toLocaleString()}** ${E.coin}`,    inline: true },
      { name: `${E.gem} Total`,        value: `**${total.toLocaleString()}** ${E.coin}`,                  inline: true },
      { name: `${E.star} Level`,       value: `**${user.level}** ${E.sparkle}`,                           inline: true },
      { name: `${E.chart} XP`,         value: `**${xpNow.toLocaleString()}** XP`,                         inline: true },
      { name: `${E.fire} Streak`,      value: `**${user.daily_streak}** days ${E.heart}`,                 inline: true },
      { name: `${E.chart} XP Bar`,     value: `\`[${bar}]\` ${progress * 10}%`,                           inline: false },
    )
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
