import { Client, EmbedBuilder, TextChannel, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { fetchAnimeMeme, fetchAnimeImage } from "./animeImages.js";
import { COLORS, cuteFooter } from "./embeds.js";
import { getGuildSettings } from "./db.js";

const PREFERRED_CHANNEL_NAMES = ["anime", "anime-memes", "kawaii", "bot-spam", "bot", "general", "chat", "main"];

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
    const settings   = await getGuildSettings(guild.id);
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
          .setDescription(`**${meme.title}**\n\n${caption}`)
          .setImage(meme.url)
          .setFooter({ text: `${cuteFooter()} • r/${meme.subreddit}` })
          .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setLabel("🔗 View Post").setStyle(ButtonStyle.Link).setURL(meme.postLink)
        );
        await channel.send({ embeds: [embed], components: [row] });
      } else {
        const imgUrl = await fetchAnimeImage();
        if (!imgUrl) continue;
        const embed = new EmbedBuilder()
          .setColor(COLORS.kawaii)
          .setTitle("🌸 Hourly Kawaii Drop~!! ✿")
          .setDescription(caption)
          .setImage(imgUrl)
          .setFooter({ text: cuteFooter() })
          .setTimestamp();
        await channel.send({ embeds: [embed] });
      }
    } catch { /* skip guild on error */ }
  }
}

export function startAnimeDrop(client: Client): void {
  const INTERVAL_MS = 60 * 60 * 1000;
  setTimeout(() => {
    sendAnimeDrop(client);
    setInterval(() => sendAnimeDrop(client), INTERVAL_MS);
  }, 5 * 60 * 1000);
}
