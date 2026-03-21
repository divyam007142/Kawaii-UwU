import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, getInventory } from "../../utils/db.js";
import { getItem, RARITY_EMOJI } from "../../utils/shop.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

export const data = new SlashCommandBuilder()
  .setName("inventory")
  .setDescription("View all items in your Kawaii inventory~! 🎒♡")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("Peek at another user's inventory ✿").setRequired(false)
  );

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  const target    = interaction.options.getUser("user") ?? interaction.user;
  await getUser(target.id, target.username);
  const inventory = await getInventory(target.id);
  const name      = target.displayName ?? target.username;

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(`${E.pack} ${name}'s Inventory~ ♡`)
    .setThumbnail(target.displayAvatarURL())
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  if (inventory.length === 0) {
    embed.setDescription(`This inventory is empty~! 😢\nVisit \`/shop\` to start collecting!! ${E.cart}`);
  } else {
    const lines = inventory.map((inv: any) => {
      const item = getItem(inv.item_id);
      if (!item) return `• Unknown Item x${inv.quantity}`;
      return `${item.emoji} **${item.name}** ${RARITY_EMOJI[item.rarity]} ×**${inv.quantity}**\n> ${item.description}`;
    });
    embed.setDescription(lines.join("\n\n"));
  }

  await interaction.reply({ embeds: [embed] });
}
