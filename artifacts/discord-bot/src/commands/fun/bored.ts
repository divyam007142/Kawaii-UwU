import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import axios from "axios";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { fetchAnimeImage } from "../../utils/animeImages.js";

const ANIME_ACTIVITIES = [
  { activity: "Rewatch your all-time favourite anime episode", emoji: "📺" },
  { activity: "Make a list of your top 10 anime of all time", emoji: "📝" },
  { activity: "Try drawing your favourite anime character", emoji: "🎨" },
  { activity: "Look up the opening song of an anime you love and sing along", emoji: "🎵" },
  { activity: "Start that anime you've been putting off forever", emoji: "🌸" },
  { activity: "Join an anime fan server and make new friends~! ♡", emoji: "💬" },
  { activity: "Open a /lootbox — you might get something legendary~!", emoji: "📦" },
  { activity: "Challenge someone to /trivia right now!", emoji: "🧠" },
  { activity: "Spin the /gamble slots and pray to the anime gods", emoji: "🎰" },
  { activity: "Write a 3-sentence summary of your favourite anime plot", emoji: "✍️" },
  { activity: "Find a new anime wallpaper for your desktop", emoji: "🖼️" },
  { activity: "Try learning a few words in Japanese~! ♡", emoji: "🇯🇵" },
  { activity: "Make your perfect anime watching snack and enjoy~", emoji: "🍜" },
  { activity: "Watch an anime movie you've never seen before", emoji: "🎬" },
  { activity: "Rank your top 5 anime openings of all time~", emoji: "⭐" },
];

export const data = new SlashCommandBuilder()
  .setName("bored")
  .setDescription("Need something to do? Get a kawaii activity suggestion~! 🎯✨");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const useAnime = Math.random() < 0.6;
  const thumbnail = await fetchAnimeImage("waifu");

  if (useAnime) {
    const a = ANIME_ACTIVITIES[Math.floor(Math.random() * ANIME_ACTIVITIES.length)];
    const embed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setTitle(`${a.emoji} Beat the Boredom — Anime Edition~! ✿`)
      .setDescription(`**${a.activity}**\n\n*A kawaii suggestion, just for you~!! (◕ᴗ◕✿)*`)
      .setThumbnail(thumbnail ?? null)
      .setFooter({ text: cuteFooter() })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  try {
    const res = await axios.get("https://bored-api.appbrewery.com/random", { timeout: 4000 });
    const a = res.data;
    const embed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setTitle("🎯 Beat the Boredom~!! ✿")
      .setDescription(`**${a.activity}**`)
      .addFields(
        { name: "📂 Type",        value: `**${a.type}**`,                                         inline: true },
        { name: "👥 Participants", value: `**${a.participants}**`,                                  inline: true },
        { name: "💰 Cost",        value: `**${a.price === 0 ? "Free~! ♡" : `$${a.price}`}**`,     inline: true }
      )
      .setThumbnail(thumbnail ?? null)
      .setFooter({ text: cuteFooter() })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  } catch {
    const a = ANIME_ACTIVITIES[Math.floor(Math.random() * ANIME_ACTIVITIES.length)];
    const embed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setTitle(`${a.emoji} Beat the Boredom~!! ✿`)
      .setDescription(`**${a.activity}**\n\n*A kawaii suggestion, just for you~!! ♡*`)
      .setThumbnail(thumbnail ?? null)
      .setFooter({ text: cuteFooter() })
      .setTimestamp();
    await interaction.editReply({ embeds: [embed] });
  }
}
