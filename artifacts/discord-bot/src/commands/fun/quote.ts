import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import axios from "axios";
import { funEmbed, errorEmbed } from "../../utils/embeds.js";

const FALLBACK_QUOTES = [
  { content: "The void stares back... but in a cute way~ ♡", author: "Kawaii Bot" },
  { content: "Every Void Coin you earn is a step toward becoming legendary~!", author: "The Economy ✿" },
  { content: "In the server, we are all equal. Except the rich ones.", author: "Unknown" },
  { content: "Anime is not a phase. It's a lifestyle~ 🌸", author: "Weeb Wisdom" },
  { content: "You miss 100% of the loot boxes you don't open.", author: "Kawaii Sensei 🎀" },
  { content: "Be the kawaii you wish to see in the world~ (◕ᴗ◕✿)", author: "Kawaii Bot" },
];

export const data = new SlashCommandBuilder()
  .setName("quote")
  .setDescription("Get a random inspiring quote to fuel your day~ 💬✨");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const res = await axios.get("https://zenquotes.io/api/random", { timeout: 4000 });
    const q = res.data[0];
    const embed = funEmbed("💬 Daily Inspiration~ ♡", `*"${q.q}"*\n\n— **${q.a}**`);
    await interaction.editReply({ embeds: [embed] });
  } catch {
    const q = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    const embed = funEmbed("💬 Daily Inspiration~ ♡", `*"${q.content}"*\n\n— **${q.author}**`);
    await interaction.editReply({ embeds: [embed] });
  }
}
