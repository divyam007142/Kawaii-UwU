import {
  Client, EmbedBuilder, TextChannel, ChannelType,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
} from "discord.js";
import { fetchAnimeMeme, fetchAnimeImage } from "./animeImages.js";
import { COLORS, cuteFooter } from "./embeds.js";
import { getGuildSettings } from "./db.js";

const PREFERRED_CHANNEL_NAMES = [
  "anime", "anime-memes", "kawaii", "bot-spam", "bot", "general", "chat", "main",
];

const DROP_CAPTIONS = [
  "Spotted this in the void and thought of you~! 🌸♡",
  "Your hourly dose of anime serotonin!! (◕ᴗ◕✿)",
  "The void delivered this just for you~! ✨♡",
  "One kawaii meme, on the house~!! 🎀",
  "Dropping this here before I forget~!! ヾ(≧▽≦*)o",
  "This meme chose YOU~!! uwu ✿",
  "Behold — your hourly anime blessing!! 🙏✨",
  "I found this during my void travels~!! 🌀♡",
  "Fresh from the anime dimension~!! 🌸✨",
  "Delivering maximum kawaii to your feed~!! ♡",
];

async function findChannel(guild: any): Promise<TextChannel | null> {
  try {
    const settings    = await getGuildSettings(guild.id);
    const configuredId = settings?.anime_drop_channel_id;
    if (configuredId) {
      const ch = guild.channels.cache.get(configuredId);
      if (ch?.type === ChannelType.GuildText) return ch as TextChannel;
    }
  } catch { /* ignore db error, fall through */ }

  for (const name of PREFERRED_CHANNEL_NAMES) {
    const ch = guild.channels.cache.find(
      (c: any) => c.type === ChannelType.GuildText && c.name.toLowerCase().includes(name)
    );
    if (ch) return ch as TextChannel;
  }

  const systemCh = guild.systemChannel;
  if (systemCh) return systemCh;

  const fallback = guild.channels.cache.find(
    (c: any) => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me)?.has("SendMessages")
  );
  return (fallback as TextChannel) ?? null;
}

async function sendAnimeDrop(client: Client): Promise<void> {
  const meme = await fetchAnimeMeme();

  for (const guild of client.guilds.cache.values()) {
    const channel = await findChannel(guild);
    if (!channel) continue;

    try {
      const caption = DROP_CAPTIONS[Math.floor(Math.random() * DROP_CAPTIONS.length)];

      if (meme) {
        const embed = new EmbedBuilder()
          .setColor(COLORS.kawaii)
          .setTitle("🌸 Hourly Anime Drop~!! ✿")
          .setDescription(
            `**${meme.title}**\n\n${caption}\n\n` +
            `> 🕐 Drops every hour on the dot~\n` +
            `> 📌 \`r/${meme.subreddit}\``
          )
          .setImage(meme.url)
          .addFields(
            { name: "⬆️ Upvotes", value: `\`${(meme.ups ?? 0).toLocaleString()}\``, inline: true },
            { name: "📅 Posted",  value: `<t:${Math.floor((meme.created ?? Date.now() / 1000))}:R>`, inline: true },
            { name: "🌸 Next Drop", value: `<t:${Math.floor((Date.now() + 3600_000) / 1000)}:R>`, inline: true },
          )
          .setFooter({ text: `${cuteFooter()} • Kawaii Bot Hourly Drop` })
          .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel("🔗 View Post")
            .setStyle(ButtonStyle.Link)
            .setURL(meme.postLink),
          new ButtonBuilder()
            .setLabel("🌸 r/" + meme.subreddit)
            .setStyle(ButtonStyle.Link)
            .setURL(`https://reddit.com/r/${meme.subreddit}`),
        );

        await channel.send({ embeds: [embed], components: [row] });
      } else {
        const imgUrl = await fetchAnimeImage();
        if (!imgUrl) continue;

        const embed = new EmbedBuilder()
          .setColor(COLORS.kawaii)
          .setTitle("🌸 Hourly Kawaii Drop~!! ✿")
          .setDescription(
            `${caption}\n\n` +
            `> 🕐 Drops every hour on the dot~\n` +
            `> 🌸 Next drop: <t:${Math.floor((Date.now() + 3600_000) / 1000)}:R>`
          )
          .setImage(imgUrl)
          .setFooter({ text: `${cuteFooter()} • Kawaii Bot Hourly Drop` })
          .setTimestamp();

        await channel.send({ embeds: [embed] });
      }
    } catch { /* skip guild on error */ }
  }
}

export function startAnimeDrop(client: Client): void {
  const HOUR_MS = 60 * 60 * 1000;

  // Align to the exact next top-of-the-hour
  const now          = Date.now();
  const nextHour     = Math.ceil(now / HOUR_MS) * HOUR_MS;
  const msUntilHour  = nextHour - now;
  const minsUntil    = Math.round(msUntilHour / 60_000);

  console.log(`[ANIME DROP] ✦ First drop in ${minsUntil} min — aligned to ${new Date(nextHour).toUTCString()}`);

  // Fire exactly at the top of the hour, then every hour after
  setTimeout(() => {
    sendAnimeDrop(client);
    setInterval(() => sendAnimeDrop(client), HOUR_MS);
  }, msUntilHour);
}
