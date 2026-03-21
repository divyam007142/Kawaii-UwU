import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { fetchAnimeGif } from "../../utils/animeImages.js";

const REACTIONS = [
  "hug", "pat", "kiss", "slap", "cry", "dance", "laugh", "smile",
  "wave", "blush", "poke", "bite", "cuddle", "wink", "handshake",
];

const REACTION_EMOJIS: Record<string, string> = {
  hug: "🤗", pat: "🥺", kiss: "💋", slap: "💢", cry: "😭",
  dance: "💃", laugh: "😂", smile: "😊", wave: "👋", blush: "🥰",
  poke: "👉", bite: "😤", cuddle: "🫂", wink: "😉", handshake: "🤝",
};

const REACTION_MESSAGES: Record<string, (user: string, target?: string) => string> = {
  hug:       (u, t) => t ? `**${u}** wraps **${t}** in the warmest hug~!! 🤗♡` : `**${u}** wants a big warm hug~! 🤗`,
  pat:       (u, t) => t ? `**${u}** gives **${t}** the gentlest head pats~!! 🥺♡` : `**${u}** desperately needs head pats!!`,
  kiss:      (u, t) => t ? `**${u}** gives **${t}** a sweet kiss~!! 💋💕` : `**${u}** wants to kiss someone~!! ♡`,
  slap:      (u, t) => t ? `**${u}** slaps **${t}** with kawaii force!! 💢` : `**${u}** slaps the air dramatically!!`,
  cry:       (u, _) => `**${u}** is crying~!! Someone comfort them please!! 😭`,
  dance:     (u, t) => t ? `**${u}** drags **${t}** onto the dance floor~!! 💃🕺` : `**${u}** is doing a happy dance!! 🎉`,
  laugh:     (u, _) => `**${u}** is laughing so hard they can't breathe!! 😂✨`,
  smile:     (u, t) => t ? `**${u}** gives **${t}** the warmest smile~!! 😊♡` : `**${u}** smiles radiantly~!! 😊`,
  wave:      (u, t) => t ? `**${u}** waves cutely at **${t}**~!! 👋♡` : `**${u}** waves hello~!! 👋`,
  blush:     (u, t) => t ? `**${u}** blushes super hard at **${t}**~!! 🥰` : `**${u}** is blushing!! (⁄ ⁄•⁄ω⁄•⁄ ⁄)`,
  poke:      (u, t) => t ? `**${u}** pokes **${t}**~!! *poke poke* 👉` : `**${u}** pokes around curiously~!!`,
  bite:      (u, t) => t ? `**${u}** playfully bites **${t}**~!! nom nom 😤` : `**${u}** is in a biting mood!!`,
  cuddle:    (u, t) => t ? `**${u}** cuddles up to **${t}**~!! So cozy~!! 🫂♡` : `**${u}** wants someone to cuddle~!!`,
  wink:      (u, t) => t ? `**${u}** winks at **${t}**~!! 😉✨` : `**${u}** winks mysteriously~!!`,
  handshake: (u, t) => t ? `**${u}** shakes hands with **${t}**~!! Friends forever!! 🤝♡` : `**${u}** offers a friendly handshake~!!`,
};

const command = new SlashCommandBuilder()
  .setName("anime")
  .setDescription("Send a kawaii anime GIF reaction to express yourself~!! 🌸✨")
  .addStringOption((opt) =>
    opt.setName("action")
      .setDescription("Pick a reaction to express yourself~ ✿")
      .setRequired(true)
      .addChoices(...REACTIONS.map((r) => ({ name: `${REACTION_EMOJIS[r]} ${r}`, value: r })))
  )
  .addUserOption((opt) =>
    opt.setName("target").setDescription("Who to direct the reaction at (optional) ♡").setRequired(false)
  );

export const data    = command;
export const cooldown = 3;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const action   = interaction.options.getString("action", true);
  const target   = interaction.options.getUser("target");
  const username = interaction.user.displayName ?? interaction.user.username;
  const targetName = target?.displayName ?? target?.username;

  const gif = await fetchAnimeGif(action);

  if (!gif) {
    await interaction.editReply({ embeds: [errorEmbed("Couldn't fetch a GIF right now~ Try again!! ♡")] });
    return;
  }

  const message  = REACTION_MESSAGES[action]?.(username, targetName) ?? `**${username}** does ${action}~!!`;
  const emoji    = REACTION_EMOJIS[action] ?? "✨";
  const title    = `${emoji} ${action.charAt(0).toUpperCase() + action.slice(1)}~!! ♡`;

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle(title)
    .setDescription(message)
    .setImage(gif)
    .setFooter({ text: cuteFooter() })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
