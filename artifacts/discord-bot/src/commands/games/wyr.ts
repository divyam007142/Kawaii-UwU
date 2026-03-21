import {
  SlashCommandBuilder, ChatInputCommandInteraction,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder,
} from "discord.js";
import { COLORS, cuteFooter } from "../../utils/embeds.js";

const QUESTIONS = [
  ["Have infinite money but no friends", "Have all the friends in the world but no money"],
  ["Be able to fly but only at walking speed", "Be able to teleport but only to places you've been"],
  ["Never have to sleep", "Never have to eat"],
  ["Know when you're going to die", "Know how you're going to die"],
  ["Be fluent in all languages", "Be a master of every musical instrument"],
  ["Have every anime card as legendary ✨", "Have unlimited Void Coins but only common items"],
  ["Live in a world with no internet", "Live in a world with no music"],
  ["Be a famous streamer with no privacy", "Be incredibly skilled but completely unknown"],
  ["Lose all your memories from the past year", "Lose all your money 💸"],
  ["Fight 100 duck-sized horses", "Fight 1 horse-sized duck"],
  ["Always have to say what's on your mind", "Never speak again"],
  ["Date a kawaii bot 🌸", "Date a really boring human"],
];

export const data = new SlashCommandBuilder()
  .setName("wyr")
  .setDescription("Would You Rather? A fun community vote where everyone picks a side~! 🤔✨");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  const q      = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  const votes  = { a: 0, b: 0 };
  const voted  = new Set<string>();

  const embed = new EmbedBuilder()
    .setColor(COLORS.game)
    .setTitle("🤔 Would You Rather~...? ✿")
    .setDescription(
      `**Option A:** ${q[0]}\n\n**Option B:** ${q[1]}\n\n` +
      `*Click a button to vote~!! You have **30 seconds**!! ♡*`
    )
    .setFooter({ text: cuteFooter() });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("wyr_a").setLabel("🅰️ Option A").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("wyr_b").setLabel("🅱️ Option B").setStyle(ButtonStyle.Danger)
  );

  const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30000,
  });

  collector.on("collect", async (btn) => {
    if (voted.has(btn.user.id)) {
      await btn.reply({ content: "You already voted~! ♡", ephemeral: true });
      return;
    }
    voted.add(btn.user.id);
    if (btn.customId === "wyr_a") votes.a++;
    else votes.b++;
    await btn.deferUpdate();
  });

  collector.on("end", async () => {
    const total    = votes.a + votes.b || 1;
    const aPercent = Math.round((votes.a / total) * 100);
    const bPercent = 100 - aPercent;
    const winner   = votes.a >= votes.b ? "A" : "B";
    const aBar     = "█".repeat(Math.round(aPercent / 10)) + "░".repeat(10 - Math.round(aPercent / 10));
    const bBar     = "█".repeat(Math.round(bPercent / 10)) + "░".repeat(10 - Math.round(bPercent / 10));

    const resultEmbed = new EmbedBuilder()
      .setColor(COLORS.kawaii)
      .setTitle("🤔 Would You Rather — Results~!! ♡")
      .setDescription(
        `**🅰️ Option A:** ${q[0]}\n\`[${aBar}]\` **${aPercent}%** (${votes.a} votes)\n\n` +
        `**🅱️ Option B:** ${q[1]}\n\`[${bBar}]\` **${bPercent}%** (${votes.b} votes)\n\n` +
        `🏆 The server chose **Option ${winner}**~!! ✿`
      )
      .setFooter({ text: `${cuteFooter()} • ${total} total votes ♡` });

    await interaction.editReply({ embeds: [resultEmbed], components: [] });
  });
}
