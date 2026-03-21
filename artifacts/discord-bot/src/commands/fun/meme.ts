import { SlashCommandBuilder, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import axios from "axios";
import { funEmbed, errorEmbed, cuteFooter } from "../../utils/embeds.js";

export const data = new SlashCommandBuilder()
  .setName("meme")
  .setDescription("Get a random trending meme to brighten your day~ 😂✨");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const response = await axios.get("https://meme-api.com/gimme", { timeout: 5000 });
    const meme = response.data;

    const embed = funEmbed(
      meme.title,
      `📌 **r/${meme.subreddit}** • 👍 ${meme.ups.toLocaleString()} upvotes`
    , meme.url)
      .setFooter({ text: `${cuteFooter()} • 🔞 NSFW: ${meme.nsfw ? "Yes" : "No"}` });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("🔄 Another Meme").setStyle(ButtonStyle.Primary).setCustomId("another_meme"),
      new ButtonBuilder().setLabel("🔗 Source").setStyle(ButtonStyle.Link).setURL(meme.postLink)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed("Couldn't fetch a meme right now~ Try again!! ♡")] });
  }
}
