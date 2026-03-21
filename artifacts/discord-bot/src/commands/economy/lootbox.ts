import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getInventory, removeItem, addItem, query } from "../../utils/db.js";
import { openLootBox, getItem } from "../../utils/shop.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("lootbox")
  .setDescription("Open a loot box from your inventory for random rewards~!! 📦✨")
  .addStringOption((opt) =>
    opt.setName("type").setDescription("Which loot box to open? ✿").setRequired(true)
      .addChoices(
        { name: "📦 Common Loot Box",    value: "lootbox_common"    },
        { name: "🎁 Rare Loot Box",      value: "lootbox_rare"      },
        { name: "👑 Legendary Loot Box", value: "lootbox_legendary" }
      )
  );

export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const boxId   = interaction.options.getString("type", true);
  const boxItem = getItem(boxId);
  if (!boxItem) {
    await interaction.editReply({ embeds: [errorEmbed("Invalid loot box type~ ♡")] });
    return;
  }

  const inventory = await getInventory(interaction.user.id);
  const owned     = inventory.find((i: any) => i.item_id === boxId);

  if (!owned || owned.quantity < 1) {
    await interaction.editReply({
      embeds: [errorEmbed(`You don't have a **${boxItem.emoji} ${boxItem.name}**~!\nBuy one from \`/shop\` first!! ${E.cart}`)],
    });
    return;
  }

  await removeItem(interaction.user.id, boxId, 1);
  const rewards = openLootBox(boxId);

  if (rewards.coins > 0) {
    await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [rewards.coins, interaction.user.id]);
  }
  if (rewards.item) await addItem(interaction.user.id, rewards.item.id);

  const rarityColors: Record<string, number> = {
    common:    COLORS.info    as number,
    rare:      COLORS.primary as number,
    legendary: COLORS.economy as number,
  };
  const color = rarityColors[boxItem.rarity] ?? (COLORS.kawaii as number);

  const embed = new EmbedBuilder()
    .setColor(color as any)
    .setTitle(`${E.box} Opening ${boxItem.name}~!! ✨`)
    .setDescription(
      `*cracking open the box...* 🌸\n\n` +
      `${E.sparkle} **You received:**\n\n` +
      `${E.coin} **${rewards.coins.toLocaleString()} Void Coins**\n` +
      (rewards.item ? `${rewards.item.emoji} **${rewards.item.name}** *(${rewards.item.rarity})* ♡` : "")
    )
    .setFooter({ text: `${cuteFooter()} • get more loot boxes at /shop ${E.shop}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
