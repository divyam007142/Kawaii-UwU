import {
  SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} from "discord.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { getUser } from "../../utils/db.js";
import { startGame, guessGames } from "../../utils/guessGame.js";

export const data = new SlashCommandBuilder()
  .setName("guess")
  .setDescription("Guess my secret number (1–100) in 7 tries~!! 🎯✨ Bet coins for a bigger reward!")
  .addIntegerOption((opt) =>
    opt.setName("bet")
      .setDescription("Bet Void Coins — win them back if you guess right~! 🪙")
      .setMinValue(10)
  );

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const bet    = interaction.options.getInteger("bet") ?? 0;

  if (guessGames.has(userId)) {
    await interaction.reply({
      embeds: [errorEmbed("You already have an active game~! Click **Guess Again** on your current game!! ♡")],
      ephemeral: true,
    });
    return;
  }

  if (bet > 0) {
    const user = await getUser(userId, interaction.user.username);
    if (parseInt(user.balance) < bet) {
      await interaction.reply({
        embeds: [errorEmbed(`You only have **${parseInt(user.balance).toLocaleString()}** 🪙 ~ can't bet **${bet.toLocaleString()}** ♡`)],
        ephemeral: true,
      });
      return;
    }
  }

  startGame(userId, bet);

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle("🎯 Number Guessing Game~!! ✿")
    .setDescription(
      `I'm thinking of a number between **1** and **100**~!! 🌸\n` +
      `You have **7 attempts** to guess it!! (◕ᴗ◕✿)\n\n` +
      (bet > 0 ? `💰 **${bet.toLocaleString()} 🪙 on the line~!** Win them back if you guess right!! ♡\n\n` : "") +
      `*Click the button below to submit your guess~!!*`
    )
    .setFooter({ text: cuteFooter() });

  const btn = new ButtonBuilder()
    .setCustomId(`guess_btn_${userId}`)
    .setLabel("🎯 Submit My Guess~!")
    .setStyle(ButtonStyle.Primary);

  await interaction.reply({
    embeds: [embed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(btn)],
  });
}
