import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { fetchAnimeGif, fetchAnimeImage } from "../../utils/animeImages.js";

const LINES = [
  "Are you a library book? Because I've been checking you out.",
  "Do you have a sunburn, or are you always this hot?",
  "If you were a vegetable, you'd be a cute-cumber.",
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "I must be a snowflake because I've fallen for you.",
  "Do you have a map? I keep getting lost in your eyes.",
  "Are you a star? Because your beauty lights up my night.",
  "If hearts could be heard, mine would be saying your name right now.",
  "Are you a camera? Every time I see you, I smile.",
  "Is your name Autumn? Because you make me fall every time.",
  "Are you a dream? Because I never want to wake up from you.",
  "You must be made of stardust because everything about you sparkles.",
  "I was going to say something clever, but then you smiled and I forgot everything.",
  "Are you a rainbow? Because you appeared after the storm in my life.",
  "If beauty were a crime, you'd be doing a life sentence.",
  "Do you have a name, or can I call you mine?",
  "You look like someone who could make a Monday feel like a Friday.",
  "I think the sun is jealous of how bright you shine.",
  "Can I follow you? Because my heart keeps pointing in your direction.",
  "Are you a song? Because I can't stop replaying you in my head.",
];

export const data = new SlashCommandBuilder()
  .setName("pickup")
  .setDescription("Get a smooth kawaii pickup line~!! 😏✨ (use wisely or recklessly ♡)");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const line = LINES[Math.floor(Math.random() * LINES.length)];
  const useGif = Math.random() < 0.5;
  let imageUrl: string | null = null;

  if (useGif) {
    imageUrl = await fetchAnimeGif("wink") ?? await fetchAnimeGif("blush");
  } else {
    imageUrl = await fetchAnimeImage("neko");
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle("😏 Pickup Line~!! ♡")
    .setDescription(`*"${line}"*`)
    .setFooter({ text: `${cuteFooter()} • use responsibly~ ♡` })
    .setTimestamp();

  if (useGif && imageUrl) embed.setImage(imageUrl);
  else if (imageUrl) embed.setThumbnail(imageUrl);

  await interaction.editReply({ embeds: [embed] });
}
