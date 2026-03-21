import {
  SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} from "discord.js";
import { getUser, getInventory, addItem, removeItem } from "../../utils/db.js";
import { query } from "../../utils/db.js";
import { getItem } from "../../utils/shop.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("trade")
  .setDescription("Trade Void Coins or items with another user in the server~ 🤝♡")
  .addUserOption((opt) =>
    opt.setName("user")
      .setDescription("Which user do you want to trade with? ✿")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("offer_item").setDescription("Item ID you are offering (optional)")
  )
  .addIntegerOption((opt) =>
    opt.setName("offer_coins").setDescription("Void Coins you are offering (optional)").setMinValue(0)
  )
  .addStringOption((opt) =>
    opt.setName("request_item").setDescription("Item ID you want from them (optional)")
  )
  .addIntegerOption((opt) =>
    opt.setName("request_coins").setDescription("Void Coins you want in return (optional)").setMinValue(0)
  );

export const cooldown = 10;

export async function execute(interaction: ChatInputCommandInteraction) {
  const target = interaction.options.getUser("user", true);

  if (target.id === interaction.user.id || target.bot) {
    await interaction.reply({ embeds: [errorEmbed("You can't trade with yourself or a bot sweetie~! ♡")], ephemeral: true });
    return;
  }

  const offerItemId   = interaction.options.getString("offer_item");
  const offerCoins    = interaction.options.getInteger("offer_coins") ?? 0;
  const requestItemId = interaction.options.getString("request_item");
  const requestCoins  = interaction.options.getInteger("request_coins") ?? 0;

  const sender   = await getUser(interaction.user.id, interaction.user.username);
  const receiver = await getUser(target.id, target.username);

  if (offerCoins > 0 && parseInt(sender.balance) < offerCoins) {
    await interaction.reply({ embeds: [errorEmbed(`You don't have **${offerCoins.toLocaleString()}** 🪙 to offer~! ♡`)], ephemeral: true });
    return;
  }

  if (offerItemId) {
    const senderInv = await getInventory(interaction.user.id);
    if (!senderInv.find((i: any) => i.item_id === offerItemId)) {
      await interaction.reply({ embeds: [errorEmbed(`You don't have **${getItem(offerItemId)?.name ?? offerItemId}** in your inventory~! ♡`)], ephemeral: true });
      return;
    }
  }

  const offerItemData   = offerItemId   ? getItem(offerItemId)   : null;
  const requestItemData = requestItemId ? getItem(requestItemId) : null;
  const senderName      = interaction.user.displayName ?? interaction.user.username;
  const receiverName    = target.displayName ?? target.username;

  const tradeEmbed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle("🤝 Trade Request~!! ♡")
    .setDescription(
      `**${senderName}** wants to trade with **${receiverName}**~! (◕ᴗ◕✿)\n\n` +
      `**📤 Offering:**\n` +
      (offerCoins > 0    ? `🪙 ${offerCoins.toLocaleString()} Void Coins\n`        : "") +
      (offerItemData     ? `${offerItemData.emoji} ${offerItemData.name}\n`        : "") +
      (!offerCoins && !offerItemData ? "Nothing ♡\n"                               : "") +
      `\n**📥 Requesting:**\n` +
      (requestCoins > 0  ? `🪙 ${requestCoins.toLocaleString()} Void Coins\n`     : "") +
      (requestItemData   ? `${requestItemData.emoji} ${requestItemData.name}\n`   : "") +
      (!requestCoins && !requestItemData ? "Nothing ♡\n"                          : "") +
      `\n*${receiverName}, you have **60 seconds** to accept or decline~! ✿*`
    )
    .setFooter({ text: cuteFooter() });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("trade_accept").setLabel("✅ Accept~!").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("trade_decline").setLabel("❌ Decline").setStyle(ButtonStyle.Danger)
  );

  const msg = await interaction.reply({ content: `<@${target.id}>`, embeds: [tradeEmbed], components: [row], fetchReply: true });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (btn) => btn.user.id === target.id,
    time: 60000,
  });

  collector.on("collect", async (btn) => {
    collector.stop();

    if (btn.customId === "trade_decline") {
      const declineEmbed = new EmbedBuilder()
        .setColor(COLORS.error)
        .setTitle("❌ Trade Declined~")
        .setDescription(`**${receiverName}** declined the trade. Maybe next time~! ♡`)
        .setFooter({ text: cuteFooter() });
      await btn.update({ embeds: [declineEmbed], components: [] });
      return;
    }

    if (requestCoins > 0 && parseInt(receiver.balance) < requestCoins) {
      const embed = new EmbedBuilder().setColor(COLORS.error).setTitle("❌ Trade Failed~").setDescription("The other user doesn't have enough coins~! ♡").setFooter({ text: cuteFooter() });
      await btn.update({ embeds: [embed], components: [] });
      return;
    }

    if (requestItemId) {
      const recvInv = await getInventory(target.id);
      if (!recvInv.find((i: any) => i.item_id === requestItemId)) {
        const embed = new EmbedBuilder().setColor(COLORS.error).setTitle("❌ Trade Failed~").setDescription("The other user doesn't have the requested item~! ♡").setFooter({ text: cuteFooter() });
        await btn.update({ embeds: [embed], components: [] });
        return;
      }
    }

    if (offerCoins > 0) {
      await query("UPDATE users SET balance = balance - $1 WHERE user_id = $2", [offerCoins, interaction.user.id]);
      await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [offerCoins, target.id]);
    }
    if (requestCoins > 0) {
      await query("UPDATE users SET balance = balance - $1 WHERE user_id = $2", [requestCoins, target.id]);
      await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [requestCoins, interaction.user.id]);
    }
    if (offerItemId)   { await removeItem(interaction.user.id, offerItemId);   await addItem(target.id, offerItemId); }
    if (requestItemId) { await removeItem(target.id, requestItemId); await addItem(interaction.user.id, requestItemId); }

    const successEmbed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle("✅ Trade Complete~!! ♡")
      .setDescription(`**${senderName}** and **${receiverName}** successfully traded~! ヾ(≧▽≦*)o 🎉`)
      .setFooter({ text: cuteFooter() });
    await btn.update({ embeds: [successEmbed], components: [] });
  });

  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(COLORS.warning)
        .setTitle("⏰ Trade Expired~")
        .setDescription("The trade request timed out~ ♡ Try again!!")
        .setFooter({ text: cuteFooter() });
      await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
    }
  });
}
