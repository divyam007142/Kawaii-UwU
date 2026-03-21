import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import axios from "axios";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { fetchAnimeImage } from "../../utils/animeImages.js";

const ANIME_JOKES = [
  { setup: "Why did Naruto eat ramen every day?", punchline: "Because he couldn't Believe it!" },
  { setup: "What do you call a sleepy anime fan?", punchline: "A NaruDROWS-uto." },
  { setup: "Why don't anime characters use elevators?", punchline: "They prefer to power up one staircase at a time." },
  { setup: "How does Goku pay for things?", punchline: "With his Saiyan credit card — it has unlimited transformations." },
  { setup: "Why did the Discord bot join an anime server?", punchline: "It heard there were no bugs, only features." },
  { setup: "What do you call broke anime fans?", punchline: "Void Coin collectors with zero balance." },
  { setup: "Why did the neko cross the road?", punchline: "To find someone to headpat! ♡" },
  { setup: "What's an anime character's favorite Discord command?", punchline: "/daily — for that streak energy!" },
  { setup: "Why did Light Yagami fail the trivia?", punchline: "He could only write the wrong answers." },
  { setup: "What do you call an anime character who wins every /coinflip?", punchline: "Lucky enough to be the main character!" },
];

const FALLBACK_JOKES = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
  { setup: "Why did the Discord bot get kicked?", punchline: "It kept spamming /help in the void." },
  { setup: "What do you call a fish without eyes?", punchline: "A fsh." },
  { setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go!" },
];

export const data = new SlashCommandBuilder()
  .setName("joke")
  .setDescription("Get a random joke — sometimes anime-flavored~!! 😄✨")
  .addStringOption((opt) =>
    opt.setName("type")
      .setDescription("What kind of joke? (default: random)")
      .addChoices(
        { name: "🌸 Anime Joke",  value: "anime"  },
        { name: "😂 Random Joke", value: "random" }
      )
  );

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const type = interaction.options.getString("type") ?? (Math.random() < 0.5 ? "anime" : "random");
  const thumbnail = await fetchAnimeImage("neko");

  let setup: string, punchline: string;

  if (type === "anime") {
    const j = ANIME_JOKES[Math.floor(Math.random() * ANIME_JOKES.length)];
    setup     = j.setup;
    punchline = j.punchline;
  } else {
    try {
      const res = await axios.get("https://official-joke-api.appspot.com/random_joke", { timeout: 4000 });
      setup     = res.data.setup;
      punchline = res.data.punchline;
    } catch {
      const j = FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)];
      setup     = j.setup;
      punchline = j.punchline;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(`😄 ${type === "anime" ? "Anime Joke~! 🌸" : "Random Joke~! ✿"}`)
    .setDescription(`**${setup}**\n\n||${punchline}||`)
    .setThumbnail(thumbnail ?? null)
    .setFooter({ text: `${cuteFooter()} • click the spoiler to reveal!! ♡` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
