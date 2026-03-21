import { Message, EmbedBuilder } from "discord.js";
import { getUser, addXp } from "../utils/db.js";
import { COLORS, cuteFooter } from "../utils/embeds.js";

const XP_PER_MESSAGE  = 5;
const XP_COOLDOWN_MS  = 60000;
const xpCooldowns     = new Map<string, number>();
const pingCooldowns   = new Map<string, number>();
const PING_COOLDOWN   = 8000; // 8s between ping replies

// ── Cute ping replies ────────────────────────────────────────────────────────
const PING_REPLIES = [
  {
    title: "✿ Hewwo!! ♡",
    body:  (name: string) => `Hii **${name}**~! (◕ᴗ◕✿)\nYou called for me? I'm here!! ♡\n\nUse \`/help\` to see what I can do uwu~`,
  },
  {
    title: "🌸 Oh! You noticed me~ ♡",
    body:  (name: string) => `**${name}** pinged me and my heart went doki doki!! 💓\n\nNeed something? Try \`/help\`~ ✨`,
  },
  {
    title: "💕 kyaa~!! ♡",
    body:  (name: string) => `W-was that a ping?! ＼(≧▽≦)／\n**${name}**, you're too kind~ 🌸\n\nI'm Kawaii Bot! Type \`/help\` to play with me! ♡`,
  },
  {
    title: "🎀 Yoohoo~ I'm here! ✿",
    body:  (name: string) => `Heyy **${name}**~!! ( ´ ▽ \` )ﾉ\nYou rang? I was just floating in the void~ 🌀\n\nCheck \`/help\` for all my commands! uwu`,
  },
  {
    title: "🌙 *peeks out* ♡",
    body:  (name: string) => `Eep~! **${name}** found me!! (⌒‿⌒)\nHi hi hi!! I'm Kawaii Bot~ 🌸✨\n\nWanna play? Try \`/trivia\` or \`/gamble\`~ 🎮`,
  },
  {
    title: "✨ Ping received, master~! ♡",
    body:  (name: string) => `(づ｡◕‿‿◕｡)づ  **${name}**!!\nYour loyal Kawaii Bot is at your service~ 🎀\n\n\`/daily\` for free coins • \`/help\` for commands ♡`,
  },
  {
    title: "🍡 Hehe~ someone called! ✿",
    body:  (name: string) => `ヾ(≧▽≦*)o  **${name}** you pinged me~!\nI'm kawaii and I know it!! 💕\n\nType \`/help\` to see my full power~ 🌟`,
  },
  {
    title: "💖 *runs to you* ♡",
    body:  (name: string) => `Wheee~!! **${name}** pinged Kawaii Bot!! ٩(◕‿◕｡)۶\nI'm always here for you bestie~! 🌸\n\nTry \`/anime hug\` to give someone a hug! ♡`,
  },
];

// ── Cute reaction trigger map ────────────────────────────────────────────────
const REACTION_TRIGGERS: Record<string, string[]> = {
  "😂":  ["lol", "lmao", "haha", "hehe", "xd"],
  "❤️":  ["love", "❤️", "heart"],
  "🌸":  ["kawaii", "cute", "adorable"],
  "🌀":  ["void", "voidbot"],
  "🪙":  ["void coins", "voidcoin"],
  "🤔":  ["hmm", "idk", "maybe"],
  "💕":  ["ily", "i love", "uwu", "owo"],
  "✨":  ["omg", "wow", "amazing", "insane"],
  "😭":  ["cry", "sad", "nooo", "noooo"],
  "🎉":  ["let's go", "lets go", "yay", "woohoo", "grats"],
};

// ── Level-up cute messages ───────────────────────────────────────────────────
const LEVELUP_MSGS = [
  (lvl: number) => `🎉 **LEVEL UP~!!** ✿  You're now level **${lvl}**!! Keep chatting!! ♡`,
  (lvl: number) => `✨ Kyaa~!! You leveled up to **${lvl}**!! (◕ᴗ◕✿) You're growing so fast! 💕`,
  (lvl: number) => `🌸 Woah~!! **Level ${lvl}** unlocked!! ٩(◕‿◕｡)۶ You're amazing bestie~ ♡`,
  (lvl: number) => `🎀 **Level ${lvl}** get~!! ★ヾ(≧▽≦*)o  The void is proud of you!! ✨`,
];

export const name = "messageCreate";
export const once = false;

export async function execute(message: Message) {
  if (message.author.bot || !message.guild) return;

  const content    = message.content.toLowerCase();
  const botMention = `<@${message.client.user?.id}>`;
  const altMention = `<@!${message.client.user?.id}>`;

  // ── Bot ping reply ─────────────────────────────────────────────────────────
  if (message.content.startsWith(botMention) || message.content.startsWith(altMention)) {
    const lastPing = pingCooldowns.get(message.author.id) ?? 0;
    if (Date.now() - lastPing > PING_COOLDOWN) {
      pingCooldowns.set(message.author.id, Date.now());

      const reply = PING_REPLIES[Math.floor(Math.random() * PING_REPLIES.length)];
      const name  = message.author.displayName ?? message.author.username;

      const embed = new EmbedBuilder()
        .setColor(COLORS.kawaii)
        .setTitle(reply.title)
        .setDescription(reply.body(name))
        .setThumbnail(message.client.user?.displayAvatarURL() ?? null)
        .setFooter({ text: cuteFooter() })
        .setTimestamp();

      try {
        await message.reply({ embeds: [embed] });
      } catch (_) {}
    }
    return; // don't process XP/reactions for pure pings
  }

  // ── XP from chatting ───────────────────────────────────────────────────────
  const lastXp = xpCooldowns.get(message.author.id) ?? 0;
  if (Date.now() - lastXp > XP_COOLDOWN_MS) {
    xpCooldowns.set(message.author.id, Date.now());
    try {
      await getUser(message.author.id, message.author.username);
      const result = await addXp(message.author.id, XP_PER_MESSAGE);
      if (result?.leveledUp) {
        const msg = LEVELUP_MSGS[Math.floor(Math.random() * LEVELUP_MSGS.length)];
        await message.reply(msg(result.newLevel));
      }
    } catch (_) {}
  }

  // ── Emoji reaction triggers ────────────────────────────────────────────────
  for (const [emoji, triggers] of Object.entries(REACTION_TRIGGERS)) {
    if (triggers.some((t) => content.includes(t))) {
      try { await message.react(emoji); } catch (_) {}
      break;
    }
  }
}
