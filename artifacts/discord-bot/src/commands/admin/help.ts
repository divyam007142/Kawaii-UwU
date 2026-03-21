import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { COLORS, CURRENCY_ICON, cuteFooter } from "../../utils/embeds.js";
import { createHelpBanner } from "../../utils/canvas.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("View all Kawaii Bot commands and features~!! ✿♡");

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const bannerBuffer = await createHelpBanner();
  const attachment   = new AttachmentBuilder(bannerBuffer, { name: "kawaii-banner.png" });

  const embed = new EmbedBuilder()
    .setColor(COLORS.kawaii)
    .setTitle("✿ Kawaii Bot — Command Guide ♡")
    .setDescription(
      "*Hewwo~!! (◕ᴗ◕✿) I'm your cute economy, anime & fun companion!!*\n" +
      "*Ping me anytime and I'll say hi~!! 🌸*"
    )
    .addFields(
      {
        name: "🎭 Fun & Vibes ✿",
        value:
          "`/meme` 😂 Random trending meme\n" +
          "`/anime` 🌸 15 kawaii GIF reactions\n" +
          "`/joke` 😄 Anime-flavored & random jokes\n" +
          "`/quote` 💬 Inspiring quotes\n" +
          "`/pickup` 😏 Smooth pickup lines\n" +
          "`/roast` 🔥 Savage roasts with anime GIFs\n" +
          "`/bored` 🎯 Cure boredom with kawaii activities",
      },
      {
        name: "🎮 Mini-Games ☆",
        value:
          "`/trivia` 🧠 Answer trivia — 3 difficulties!\n" +
          "`/wyr` 🤔 Would You Rather? Vote together\n" +
          "`/coinflip` 🪙 Bet & flip a coin\n" +
          "`/guess` 🎯 Guess 1–100 in 7 tries\n" +
          "`/gamble` 🎰 Kawaii slots — spin to win!!",
      },
      {
        name: `${CURRENCY_ICON} Economy ✨`,
        value:
          "`/balance` 💰 Wallet, bank & XP bar\n" +
          "`/daily` 📅 Claim daily + streak bonus\n" +
          "`/work` 💼 Work for coins (1h cooldown)\n" +
          "`/beg` 🙏 Beg for coins (5m cooldown)\n" +
          "`/deposit` 🏦 Save coins in the bank\n" +
          "`/withdraw` 💸 Take coins from bank",
      },
      {
        name: "🏪 Shop & Items 🎀",
        value:
          "`/shop` Browse 12+ items × 4 rarities\n" +
          "`/buy` 🛒 Purchase items\n" +
          "`/sell` 💱 Sell items\n" +
          "`/inventory` 🎒 View your items\n" +
          "`/lootbox` 📦 Open loot boxes\n" +
          "`/trade` 🤝 Trade with friends",
      },
      {
        name: "🏆 Leaderboard  •  ⚙️ Setup",
        value:
          "`/leaderboard` 🏆 Richest · XP · Streak\n" +
          "`/setup` ⚙️ Configure channels via dropdown",
      },
      {
        name: "💡 Tips~!! ♡",
        value:
          "🌸 Chat to earn XP & level up automatically\n" +
          "🔥 Keep your daily streak for bonus coins\n" +
          "📦 Loot boxes drop rare & legendary items\n" +
          "📺 I post an anime meme every hour~",
      },
    )
    .setThumbnail(interaction.client.user?.displayAvatarURL() ?? null)
    .setImage("attachment://kawaii-banner.png")
    .setFooter({ text: `${cuteFooter()} • ${(interaction.client as any).commands?.size ?? 27} commands loaded ♡` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed], files: [attachment] });
}
