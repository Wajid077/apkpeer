import { getApp, type App } from "./content";

/**
 * Editorial "Popular" lists for the homepage. APKPeer has no download or rating data,
 * so this is a hand-picked order of widely used apps, not a ranking. Unpublished slugs are skipped.
 */
const POPULAR_APPS = [
  "whatsapp", "chatgpt", "google-gemini", "tiktok", "instagram", "youtube", "capcut", "telegram",
  "facebook", "netflix", "spotify", "snapchat", "canva", "brave-browser", "vlc-for-android", "facebook-lite",
];
const POPULAR_GAMES = [
  "free-fire", "roblox", "block-blast", "pubg-mobile", "minecraft", "brawl-stars", "subway-surfers", "candy-crush-saga",
  "clash-of-clans", "royal-match", "mobile-legends", "ludo-king", "stumble-guys", "8-ball-pool", "efootball", "minecraft-trial",
];

const pick = (slugs: string[], limit: number): App[] =>
  slugs.map((s) => getApp(s)).filter((a): a is App => !!a).slice(0, limit);

export const popularApps = (limit = 8) => pick(POPULAR_APPS, limit);
export const popularGames = (limit = 8) => pick(POPULAR_GAMES, limit);
