import axios from "axios";

export type AnimeImageCategory = "neko" | "waifu" | "kitsune" | "husbando";

const NEKO_BEST_IMG: AnimeImageCategory[] = ["neko", "waifu", "kitsune", "husbando"];

export async function fetchAnimeImage(category?: AnimeImageCategory): Promise<string | null> {
  const cat = category ?? NEKO_BEST_IMG[Math.floor(Math.random() * NEKO_BEST_IMG.length)];
  try {
    const res = await axios.get(`https://nekos.best/api/v2/${cat}`, { timeout: 4000 });
    return res.data?.results?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export async function fetchAnimeGif(action: string): Promise<string | null> {
  try {
    const res = await axios.get(`https://nekos.best/api/v2/${action}`, { timeout: 4000 });
    const url = res.data?.results?.[0]?.url;
    if (url) return url;
  } catch { /* fall through */ }
  try {
    const res = await axios.get(`https://api.waifu.pics/sfw/${action}`, { timeout: 4000 });
    return res.data?.url ?? null;
  } catch {
    return null;
  }
}

export async function fetchAnimeMeme(): Promise<{ title: string; url: string; postLink: string; subreddit: string } | null> {
  const subs = ["animememes", "anime_irl", "wholesomeanimemes", "goodanimemes", "Animemes"];
  const sub  = subs[Math.floor(Math.random() * subs.length)];
  try {
    const res = await axios.get(`https://meme-api.com/gimme/${sub}`, { timeout: 5000 });
    if (res.data?.nsfw) return null;
    return { title: res.data.title, url: res.data.url, postLink: res.data.postLink, subreddit: res.data.subreddit };
  } catch {
    return null;
  }
}

export const KAWAII_BANNERS = [
  "https://i.imgur.com/KfRBjfp.gif",
  "https://i.imgur.com/8RDzS6L.gif",
  "https://i.imgur.com/9wbHFSZ.gif",
];

export function randomBanner(): string {
  return KAWAII_BANNERS[Math.floor(Math.random() * KAWAII_BANNERS.length)];
}
