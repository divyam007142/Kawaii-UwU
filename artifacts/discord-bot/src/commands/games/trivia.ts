import {
  SlashCommandBuilder, ChatInputCommandInteraction,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ComponentType, EmbedBuilder,
} from "discord.js";
import axios from "axios";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { getUser, addXp } from "../../utils/db.js";
import { query } from "../../utils/db.js";
import { fetchAnimeImage } from "../../utils/animeImages.js";

function decodeHtml(html: string) {
  return html
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export const data = new SlashCommandBuilder()
  .setName("trivia")
  .setDescription("Answer a trivia question to win Void Coins and XP~!! 🧠✨")
  .addStringOption((opt) =>
    opt.setName("difficulty")
      .setDescription("How hard do you want it~? ✿")
      .addChoices(
        { name: "🟢 Easy — 50 🪙",    value: "easy"   },
        { name: "🟡 Medium — 100 🪙",  value: "medium" },
        { name: "🔴 Hard — 200 🪙",    value: "hard"   }
      )
  );

export const cooldown = 10;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const difficulty = interaction.options.getString("difficulty") ?? "medium";

  try {
    const res = await axios.get(
      `https://opentdb.com/api.php?amount=1&type=multiple&difficulty=${difficulty}`,
      { timeout: 5000 }
    );
    const q          = res.data.results[0];
    const correct    = decodeHtml(q.correct_answer);
    const allAnswers = [...q.incorrect_answers.map(decodeHtml), correct].sort(() => Math.random() - 0.5);

    const diffEmoji = difficulty === "hard" ? "🔴" : difficulty === "medium" ? "🟡" : "🟢";
    const reward    = difficulty === "hard" ? 200 : difficulty === "medium" ? 100 : 50;

    const thumbnail = await fetchAnimeImage("neko");

    const embed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setTitle("🧠 Trivia Time~!! ✿")
      .setDescription(
        `**${decodeHtml(q.question)}**\n\n` +
        `${diffEmoji} Difficulty: **${q.difficulty}**  •  📂 **${q.category}**\n\n` +
        `💡 Pick the right answer below~!\n🪙 Win **${reward} Void Coins** + **30 XP** ♡`
      )
      .setThumbnail(thumbnail ?? null)
      .setFooter({ text: `${cuteFooter()} • you have 30 seconds~!! ⏰` });

    const letters = ["🇦", "🇧", "🇨", "🇩"];
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      allAnswers.map((ans, i) =>
        new ButtonBuilder()
          .setCustomId(`trivia_${i}`)
          .setLabel(`${ans.slice(0, 80)}`)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(letters[i])
      )
    );

    const msg = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (btn) => btn.user.id === interaction.user.id,
      time: 30000,
    });

    collector.on("collect", async (btn) => {
      collector.stop();
      const idx      = parseInt(btn.customId.replace("trivia_", ""));
      const chosen   = allAnswers[idx];
      const isCorrect = chosen === correct;

      let resultEmbed: EmbedBuilder;
      if (isCorrect) {
        await getUser(interaction.user.id, interaction.user.username);
        await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [reward, interaction.user.id]);
        await addXp(interaction.user.id, 30);
        const winImg = await fetchAnimeImage("waifu");
        resultEmbed = new EmbedBuilder()
          .setColor(COLORS.success)
          .setTitle("✅ Correct~!! ♡")
          .setDescription(
            `**${correct}** was right!! You're so smart~!! (◕ᴗ◕✿)\n\n` +
            `🪙 **+${reward} Void Coins**  •  ✨ **+30 XP**`
          )
          .setThumbnail(winImg ?? null)
          .setFooter({ text: cuteFooter() });
      } else {
        resultEmbed = new EmbedBuilder()
          .setColor(COLORS.error)
          .setTitle("❌ Oopsie~!! ♡")
          .setDescription(`The correct answer was **${correct}**.\n\nBetter luck next time~!! Keep studying!! 💪`)
          .setFooter({ text: cuteFooter() });
      }

      await btn.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(COLORS.warning)
          .setTitle("⏰ Too Slow~!! ♡")
          .setDescription(`The correct answer was **${correct}**.\n\nNobody answered in time~ aww!! 😢`)
          .setFooter({ text: cuteFooter() });
        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  } catch {
    await interaction.editReply({ embeds: [errorEmbed("Couldn't fetch a trivia question right now~ Try again!! ♡")] });
  }
}
