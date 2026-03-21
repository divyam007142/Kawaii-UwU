import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";
import { fetchAnimeGif } from "../../utils/animeImages.js";

const ROASTS = [
  "Your personality has the same energy as the loading screen nobody asked for.",
  "You're the human equivalent of stepping on a LEGO at 3AM.",
  "If silence were golden, you'd be bankrupt.",
  "You're proof that even the universe makes mistakes occasionally.",
  "You bring so much joy whenever you leave the room.",
  "Your future looks bright — mainly because you'll need a flashlight to find your potential.",
  "I've seen better arguments from a fortune cookie.",
  "Your brain called — it said it's taking a day off. Again.",
  "You're like a participation trophy — technically you exist, but nobody's impressed.",
  "Some people have looks, some have brains. You're still searching.",
  "The doctor said you needed fresh air — I think that's a hint.",
  "I've met houseplants with more charisma than you.",
  "You have the energy of a Monday morning and nobody wanted that.",
  "Even your GPS gives up and says 'figure it out yourself'.",
  "You're the kind of person who trips over a wireless charger.",
  "If life gives you lemons, you'd somehow manage to lose them.",
  "You peaked in your imagination and it was still average.",
  "Your level of ambition could fit in a teaspoon with room to spare.",
  "Even autocorrect refuses to take the blame for your decisions.",
  "You're not the sharpest tool in the shed. You're the shed.",
  "Your search history is the scariest thing about you and that's impressive.",
  "Scientists are still studying what you're optimized for.",
  "You're the main character in a story nobody finished reading.",
  "Even fortune tellers charge you extra for refusing to look.",
];

const ANIME_ROAST_GIFS = ["slap", "poke"];

export const data = new SlashCommandBuilder()
  .setName("roast")
  .setDescription("Deliver a spicy roast with full kawaii energy~!! 🔥✨")
  .addUserOption((opt) =>
    opt.setName("user").setDescription("Who's getting roasted? (blank = yourself~ ♡)").setRequired(false)
  );

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const target  = interaction.options.getUser("user") ?? interaction.user;
  const roast   = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  const gifKey  = ANIME_ROAST_GIFS[Math.floor(Math.random() * ANIME_ROAST_GIFS.length)];
  const gif     = await fetchAnimeGif(gifKey);
  const name    = target.displayName ?? target.username;
  const isSelf  = target.id === interaction.user.id;

  const embed = new EmbedBuilder()
    .setColor(COLORS.error)
    .setTitle(`🔥 ${isSelf ? "Self Roast Mode~!!" : `Roasting ${name}~!!`} ✿`)
    .setDescription(`*"${roast}"*\n\n— Kawaii Bot 🌸`)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `${cuteFooter()} • roasted by ${interaction.user.displayName ?? interaction.user.username} ♡` })
    .setTimestamp();

  if (gif) embed.setImage(gif);

  await interaction.editReply({ embeds: [embed] });
}
