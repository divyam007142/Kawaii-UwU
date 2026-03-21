import { GuildMember, EmbedBuilder, TextChannel, ChannelType, AttachmentBuilder } from "discord.js";
import { getGuildSettings } from "../utils/db.js";
import { COLORS, cuteFooter } from "../utils/embeds.js";
import { createWelcomeCard } from "../utils/canvas.js";

export const name = "guildMemberAdd";
export const once = false;

const WELCOME_MSGS = [
  (name: string) => `**${name}** just arrived~!! We're so happy you're here ♡`,
  (name: string) => `A new star appeared — **${name}**!! Welcome!! ✨`,
  (name: string) => `**${name}** joined the kawaii side~!! uwu ♡`,
  (name: string) => `Hewwo **${name}**~!! Prepare for maximum kawaii!! ✿`,
  (name: string) => `The void welcomed **${name}**!! So glad you're here ♡`,
];

export async function execute(member: GuildMember) {
  try {
    const settings  = await getGuildSettings(member.guild.id);
    const channelId = settings?.welcome_channel_id;
    const count     = member.guild.memberCount;
    const name      = member.displayName ?? member.user.username;

    let channel: TextChannel | null = null;

    if (channelId) {
      const found = member.guild.channels.cache.get(channelId);
      if (found?.type === ChannelType.GuildText) channel = found as TextChannel;
    }

    if (!channel) {
      for (const n of ["welcome", "general", "chat", "main", "lobby"]) {
        const found = member.guild.channels.cache.find(
          (c) => c.type === ChannelType.GuildText && c.name.toLowerCase().includes(n)
        );
        if (found) { channel = found as TextChannel; break; }
      }
    }

    if (!channel) return;

    // Generate custom canvas welcome card
    const cardBuffer = await createWelcomeCard(
      member.user.displayAvatarURL({ extension: "png" }),
      name,
      member.guild.name,
      count
    );

    const attachment = new AttachmentBuilder(cardBuffer, { name: "welcome.png" });
    const msgFn      = WELCOME_MSGS[Math.floor(Math.random() * WELCOME_MSGS.length)];

    const embed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setDescription(msgFn(name))
      .setImage("attachment://welcome.png")
      .setFooter({ text: `${cuteFooter()} • use /help to get started ♡` });

    await channel.send({ content: `<@${member.id}>`, embeds: [embed], files: [attachment] });

    // Logs channel
    if (settings?.logs_channel_id && settings.logs_channel_id !== channelId) {
      const logsCh = member.guild.channels.cache.get(settings.logs_channel_id);
      if (logsCh?.type === ChannelType.GuildText) {
        const logEmbed = new EmbedBuilder()
          .setColor(COLORS.success)
          .setTitle("📥 Member Joined~")
          .setDescription(`<@${member.id}> (**${name}**) joined the server~ ♡`)
          .addFields(
            { name: "User ID",       value: member.id,                                                   inline: true },
            { name: "Account Age",   value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,  inline: true },
            { name: "Member Count",  value: `**${count}**`,                                              inline: true },
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setFooter({ text: "Kawaii Bot Logs ✿" })
          .setTimestamp();
        await (logsCh as TextChannel).send({ embeds: [logEmbed] });
      }
    }
  } catch (e) {
    console.error("[WELCOME]", e);
  }
}
