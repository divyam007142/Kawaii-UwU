import {
  SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder,
  PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder, ChannelType,
  StringSelectMenuInteraction, ChannelSelectMenuInteraction, ComponentType,
} from "discord.js";
import { setGuildSetting, getGuildSettings } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Configure Kawaii Bot for your server~!! ⚙️✿")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ embeds: [errorEmbed("This command can only be used in a server~! ♡")], ephemeral: true });
    return;
  }

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("setup_select")
    .setPlaceholder("✿ What would you like to configure~? ♡")
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("🌸 Welcome Channel")
        .setDescription("Set where welcome cards are sent when members join~")
        .setValue("welcome"),
      new StringSelectMenuOptionBuilder()
        .setLabel("📋 Logs Channel")
        .setDescription("Set where join/leave logs are posted~")
        .setValue("logs"),
      new StringSelectMenuOptionBuilder()
        .setLabel("📺 Hourly Anime Drop Channel")
        .setDescription("Set where the hourly anime meme drops go~")
        .setValue("anime"),
      new StringSelectMenuOptionBuilder()
        .setLabel("👀 View Current Config")
        .setDescription("See the current setup for this server~")
        .setValue("view"),
    );

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle("⚙️ Kawaii Bot Setup~!! ✿")
    .setDescription(
      `Configure **Kawaii Bot** for **${interaction.guild.name}**~! ♡\n\n` +
      `Select an option below to get started~!! (◕ᴗ◕✿)`
    )
    .setThumbnail(interaction.client.user?.displayAvatarURL() ?? null)
    .setFooter({ text: `${cuteFooter()} • requires Manage Server ♡` });

  const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

  // ── Wait for dropdown selection ──────────────────────────────────────────────
  const selectCollector = msg.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    filter: (i) => i.user.id === interaction.user.id && i.customId === "setup_select",
    time: 60000,
    max: 1,
  });

  selectCollector.on("collect", async (sel: StringSelectMenuInteraction) => {
    const choice = sel.values[0];

    if (choice === "view") {
      const settings = await getGuildSettings(interaction.guild!.id);
      const viewEmbed = new EmbedBuilder()
        .setColor(COLORS.kawaii)
        .setTitle("⚙️ Current Server Config~! ✿")
        .setDescription(`Here's how I'm set up in **${interaction.guild!.name}**~! ♡`)
        .addFields(
          { name: "🌸 Welcome Channel",    value: settings?.welcome_channel_id    ? `<#${settings.welcome_channel_id}>` : "`Not set~`",    inline: true },
          { name: "📋 Logs Channel",       value: settings?.logs_channel_id       ? `<#${settings.logs_channel_id}>` : "`Not set~`",       inline: true },
          { name: "📺 Anime Drop Channel", value: settings?.anime_drop_channel_id ? `<#${settings.anime_drop_channel_id}>` : "`Not set~`", inline: true },
        )
        .setThumbnail(interaction.client.user?.displayAvatarURL() ?? null)
        .setFooter({ text: `${cuteFooter()} • use /setup to change settings ♡` })
        .setTimestamp();
      await sel.update({ embeds: [viewEmbed], components: [] });
      return;
    }

    // ── Show channel select ───────────────────────────────────────────────────
    const labels: Record<string, string> = {
      welcome: "🌸 Welcome Channel",
      logs:    "📋 Logs Channel",
      anime:   "📺 Anime Drop Channel",
    };

    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId("setup_channel_select")
      .setPlaceholder(`Pick a channel for ${labels[choice]}~! ♡`)
      .addChannelTypes(ChannelType.GuildText);

    const channelRow = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect);

    const promptEmbed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setTitle(`${labels[choice]}~!! ✿`)
      .setDescription(`Now pick a text channel for **${labels[choice]}**~! ♡\n\n*You have 60 seconds to choose~ (◕ᴗ◕✿)*`)
      .setFooter({ text: cuteFooter() });

    await sel.update({ embeds: [promptEmbed], components: [channelRow] });

    // ── Wait for channel pick ─────────────────────────────────────────────────
    const channelCollector = msg.createMessageComponentCollector({
      componentType: ComponentType.ChannelSelect,
      filter: (i) => i.user.id === interaction.user.id && i.customId === "setup_channel_select",
      time: 60000,
      max: 1,
    });

    channelCollector.on("collect", async (chanSel: ChannelSelectMenuInteraction) => {
      const channel = chanSel.channels.first();
      if (!channel) {
        await chanSel.update({ embeds: [errorEmbed("No channel selected~! ♡")], components: [] });
        return;
      }

      const dbKey: Record<string, string> = {
        welcome: "welcome_channel_id",
        logs:    "logs_channel_id",
        anime:   "anime_drop_channel_id",
      };

      await setGuildSetting(interaction.guild!.id, dbKey[choice], channel.id);

      const doneEmbed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle("✅ Setup Complete~!! ♡")
        .setDescription(`**${labels[choice]}** has been set to <#${channel.id}>~! ✿\n\nAll done~!! ヾ(≧▽≦*)o`)
        .setFooter({ text: cuteFooter() })
        .setTimestamp();

      await chanSel.update({ embeds: [doneEmbed], components: [] });
    });

    channelCollector.on("end", async (_, reason) => {
      if (reason === "time") {
        await interaction.editReply({ embeds: [errorEmbed("Setup timed out~! Run `/setup` again when ready ♡")], components: [] });
      }
    });
  });

  selectCollector.on("end", async (_, reason) => {
    if (reason === "time") {
      await interaction.editReply({ components: [] });
    }
  });
}
