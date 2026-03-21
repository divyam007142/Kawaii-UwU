import { Interaction, Collection, EmbedBuilder } from "discord.js";
import { errorEmbed, COLORS, cuteFooter } from "../utils/embeds.js";
import { guessGames, processGuess } from "../utils/guessGame.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction: Interaction) {
  // ── Autocomplete ────────────────────────────────────────────────────────────
  if (interaction.isAutocomplete()) {
    const client  = interaction.client as any;
    const command = client.commands.get(interaction.commandName);
    if (command?.autocomplete) {
      try { await command.autocomplete(interaction); } catch (e) { console.error("Autocomplete error:", e); }
    }
    return;
  }

  // ── Button: guess submit trigger ────────────────────────────────────────────
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("guess_btn_")) {
      const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = await import("discord.js");
      const userId = interaction.customId.replace("guess_btn_", "");
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: "This isn't your game~! ♡", ephemeral: true });
        return;
      }
      if (!guessGames.has(userId)) {
        await interaction.reply({ content: "No active game found~! Use `/guess` to start one ♡", ephemeral: true });
        return;
      }
      const modal = new ModalBuilder()
        .setCustomId(`guess_modal_${userId}`)
        .setTitle("🎯 Enter Your Guess~! ♡");
      const input = new TextInputBuilder()
        .setCustomId("guess_number")
        .setLabel("Enter a number between 1 and 100~")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("e.g. 42")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(3);
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
      await interaction.showModal(modal);
      return;
    }
    return;
  }

  // ── Modal: guess submission ─────────────────────────────────────────────────
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("guess_modal_")) {
      const userId  = interaction.customId.replace("guess_modal_", "");
      const numStr  = interaction.fields.getTextInputValue("guess_number");
      const num     = parseInt(numStr);

      if (isNaN(num) || num < 1 || num > 100) {
        await interaction.reply({ embeds: [errorEmbed("Please enter a valid number between 1 and 100~! ♡")], ephemeral: true });
        return;
      }

      const result = await processGuess(userId, num);
      if (!result) {
        await interaction.reply({ embeds: [errorEmbed("No active game found~! Start one with `/guess` ♡")], ephemeral: true });
        return;
      }

      const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = await import("discord.js");
      let embed: EmbedBuilder;
      let components: any[] = [];

      if (result.correct) {
        embed = new EmbedBuilder()
          .setColor(COLORS.success)
          .setTitle("🎉 Correct~!! ♡")
          .setDescription(
            `The number was **${result.answer}**~!! You got it in **${result.attempts}** attempt${result.attempts === 1 ? "" : "s"}!! ヾ(≧▽≦*)o\n\n` +
            (result.wonCoins ? `🪙 **+${result.wonCoins.toLocaleString()} Void Coins** ♡` : "")
          )
          .setFooter({ text: cuteFooter() });
      } else if (result.gameOver) {
        embed = new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle("💀 Game Over~!")
          .setDescription(
            `You ran out of attempts~! The number was **${result.answer}** 😭\n\n` +
            (result.lostCoins ? `🪙 You lost **${result.lostCoins.toLocaleString()} Void Coins** ♡` : "Better luck next time~! ♡")
          )
          .setFooter({ text: cuteFooter() });
      } else {
        const hint    = result.tooHigh ? "📈 Too high~!" : "📉 Too low~!";
        const attLeft = result.attemptsLeft ?? 0;
        embed = new EmbedBuilder()
          .setColor(COLORS.kawaii)
          .setTitle(`🎯 ${hint} Keep Guessing~!! ✿`)
          .setDescription(
            `You guessed **${num}** — ${hint}\n\n` +
            `📊 Attempts used: **${result.attempts}/${result.maxAttempts}**\n` +
            `⏳ Attempts left: **${attLeft}**\n\n` +
            `*Click the button to guess again~! ♡*`
          )
          .setFooter({ text: cuteFooter() });
        const btn = new ButtonBuilder()
          .setCustomId(`guess_btn_${userId}`)
          .setLabel("🎯 Guess Again~!")
          .setStyle(ButtonStyle.Primary);
        components = [new ActionRowBuilder<ButtonBuilder>().addComponents(btn)];
      }

      await interaction.reply({ embeds: [embed], components });
      return;
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  // ── Slash command handler ───────────────────────────────────────────────────
  const client  = interaction.client as any;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({ embeds: [errorEmbed("Command not found.")], ephemeral: true });
    return;
  }

  const cooldowns: Collection<string, Collection<string, number>> = client.cooldowns;
  if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

  const now           = Date.now();
  const timestamps    = cooldowns.get(command.data.name)!;
  const defaultCooldown = (command.cooldown ?? 3) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expiration = timestamps.get(interaction.user.id)! + defaultCooldown;
    if (now < expiration) {
      const remaining = ((expiration - now) / 1000).toFixed(1);
      await interaction.reply({
        embeds: [errorEmbed(`Please wait **${remaining}s** before using \`/${command.data.name}\` again~ ♡`)],
        ephemeral: true,
      });
      return;
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), defaultCooldown);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[CMD ERROR] ${command.data.name}:`, error);
    const reply = { embeds: [errorEmbed("Something went wrong~! Please try again ♡")], ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
}
