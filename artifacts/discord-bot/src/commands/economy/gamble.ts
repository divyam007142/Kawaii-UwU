import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getUser, addXp, query } from "../../utils/db.js";
import { COLORS, cuteFooter, errorEmbed } from "../../utils/embeds.js";
import { E } from "../../utils/appEmojis.js";

const SLOTS = ["🍒", "🍋", "🍊", "⭐", "💎", "🌀", "🌸", "🎀"];

function spinSlots() {
  return [
    SLOTS[Math.floor(Math.random() * SLOTS.length)],
    SLOTS[Math.floor(Math.random() * SLOTS.length)],
    SLOTS[Math.floor(Math.random() * SLOTS.length)],
  ];
}

function getMultiplier(slots: string[]): { multiplier: number; label: string } {
  const [a, b, c] = slots;
  if (a === b && b === c) {
    if (a === "💎") return { multiplier: 10, label: `${E.gem} **JACKPOT~!!** Triple Diamonds!! ✨♡`       };
    if (a === "🌀") return { multiplier: 7,  label: `🌀 **VOID JACKPOT~!!** ヾ(≧▽≦*)o`                  };
    if (a === "🌸") return { multiplier: 5,  label: `🌸 **KAWAII JACKPOT~!!** (◕ᴗ◕✿)♡`                   };
    if (a === "🎀") return { multiplier: 5,  label: `🎀 **RIBBON JACKPOT~!!** SO CUTE!! ♡`               };
    if (a === "⭐") return { multiplier: 4,  label: `${E.star} **STAR JACKPOT~!!** ✨✨✨`                  };
    return { multiplier: 3, label: `${E.sparkle} Three of a Kind~!! uwu`                                   };
  }
  if (a === b || b === c || a === c) return { multiplier: 1.5, label: `✨ Two of a Kind~! nice!`           };
  return { multiplier: 0, label: `❌ No match~ better luck next time!! ♡`                                  };
}

export const data = new SlashCommandBuilder()
  .setName("gamble")
  .setDescription("Spin the kawaii slot machine~!! Big wins await!! 🎰✨")
  .addIntegerOption((opt) =>
    opt.setName("amount").setDescription("How many Void Coins to bet (min 10)").setRequired(true).setMinValue(10)
  );

export const cooldown = 5;

export async function execute(interaction: ChatInputCommandInteraction) {
  const amount  = interaction.options.getInteger("amount", true);
  const user    = await getUser(interaction.user.id, interaction.user.username);
  const balance = parseInt(user.balance);

  if (balance < amount) {
    await interaction.reply({
      embeds: [errorEmbed(`You only have **${balance.toLocaleString()}** ${E.coin}~!\nCan't bet **${amount.toLocaleString()}** ${E.coin} sweetie ♡`)],
      ephemeral: true,
    });
    return;
  }

  const slots                 = spinSlots();
  const { multiplier, label } = getMultiplier(slots);
  const winnings              = Math.floor(amount * multiplier);
  const net                   = winnings - amount;

  await query("UPDATE users SET balance = balance + $1 WHERE user_id = $2", [net, interaction.user.id]);
  if (net > 0) await addXp(interaction.user.id, 15);

  const newBalance = balance + net;
  const won        = net >= 0;

  const spinAnim = `╔══════════════╗\n║  ${slots.join("  │  ")}  ║\n╚══════════════╝`;

  const embed = new EmbedBuilder()
    .setColor(won ? (multiplier >= 4 ? COLORS.economy : COLORS.success) : COLORS.error)
    .setTitle(`${E.slots} Kawaii Slot Machine~!! ✿`)
    .setDescription(
      `${spinAnim}\n\n` +
      `${label}\n\n` +
      `${E.cash} Bet: **${amount.toLocaleString()}** ${E.coin}\n` +
      `${won
        ? `✅ Won: **${winnings.toLocaleString()}** ${E.coin} *(+${net.toLocaleString()})* ♡`
        : `❌ Lost: **${amount.toLocaleString()}** ${E.coin} aww~`
      }\n` +
      `${E.bag} Balance: **${newBalance.toLocaleString()}** ${E.coin}`
    )
    .setFooter({ text: `${cuteFooter()} • gamble responsibly~ ♡` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
