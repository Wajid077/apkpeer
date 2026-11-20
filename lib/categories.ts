export type Category = {
  slug: string;
  name: string;
  type: "app" | "game";
  /** schema.org applicationCategory */
  schemaCategory: string;
  /** Plural label for H1/titles, e.g. "Web browsers". Defaults to "{name} apps" / "{name} games". */
  label?: string;
  /**
   * 100–150 word intro for the category page (brief §5.7). Required as soon as the
   * category has a published app; the build fails without it.
   */
  intro?: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "browsers",
    name: "Browsers",
    label: "Web browsers",
    type: "app",
    schemaCategory: "BrowserApplication",
    intro:
      "Your browser is the app you probably open more than any other, so it's worth picking one on purpose. The Android browsers listed here differ mostly in three things: how much tracking they block by default, which engine they run on (most use Chromium, Firefox uses Gecko), and what they add on top, such as built-in search, AI assistants, sync or a VPN. Every page links to the official build on Google Play or the developer's own site, shows the latest version number and release notes, and explains which permissions the app asks for and why. If you're switching browsers, check the import options first: most can bring over your bookmarks and saved passwords from Chrome, which makes moving a lot less painful.",
  },
  {
    slug: "vpn",
    name: "VPN & Privacy",
    label: "VPNs & Privacy apps",
    type: "app",
    schemaCategory: "SecurityApplication",
    intro:
      "A VPN sends your phone's traffic through someone else's server, so the network you're on (café Wi-Fi, your mobile carrier, a school network) can't see which sites you visit. That also means you're handing that visibility to the VPN company instead, which is why who runs the VPN matters more than its speed claims. The pages in this category say who owns each app, how it's funded, whether it shows ads, and whether its no-logs claims have been independently audited. Free VPNs usually pay for themselves with ads, data limits or upsells, so we spell out which one applies. Every download link goes to Google Play or the provider's own site, never a modified build.",
  },
  {
    slug: "communication",
    name: "Communication",
    label: "Messaging apps",
    type: "app",
    schemaCategory: "CommunicationApplication",
    intro:
      "Messaging apps are where most of your private conversations live, so it's worth knowing how each one protects them. The apps in this category cover chats, voice and video calls, group messaging and file sharing. Each page explains whether messages are end-to-end encrypted by default, what the app stores on its servers, what you need to sign up (usually a phone number), and how backups work, since a backup can be less private than the chat itself. You'll also find the latest version, the minimum Android version, and how to install the official APK if your phone has no Play Store. We never list modified clones of messaging apps: they break encryption, and accounts using them get banned.",
  },
  {
    slug: "social",
    name: "Social",
    label: "Social media apps",
    type: "app",
    schemaCategory: "SocialNetworkingApplication",
    intro:
      "Social media apps are where most people share photos and videos, follow creators and message friends. Each page in this category explains what the app is for, what it costs (usually nothing, paid for by ads), which privacy and safety settings matter most, and what controls exist for teenagers and parents. You'll also find the latest update date, what's new, and how to install the official app if Play Store isn't available. APKPeer never lists modified or cloned versions of social apps. They break the apps' terms of service, they can steal your login or messages, and accounts that use them get suspended.",
  },
  {
    slug: "video-editors",
    name: "Video Editors",
    label: "Video editing apps",
    type: "app",
    schemaCategory: "MultimediaApplication",
    intro:
      "Phone video editors have gone from basic trimming tools to full timelines with AI captions, voiceovers and templates. The apps in this category range from quick editors for social clips to AI tools that build a video from a text prompt. Each page covers what the free version actually includes, where the watermark or export limits kick in, which features need a subscription, and how much storage and Android version you need. We link only to the official app on Google Play or the developer's site. We don't list \"pro unlocked\" or watermark-removed builds: they're a common way malware ends up on phones, and they stop receiving updates the moment you install them.",
  },
  {
    slug: "photo-editors",
    name: "Photo Editors",
    label: "Photo and design apps",
    type: "app",
    schemaCategory: "MultimediaApplication",
    intro:
      "Photo and design apps cover everything from quick fixes to full layouts: cropping and color correction, removing backgrounds, making social posts, posters and presentations. Each page here explains what the free version includes, which tools need a subscription, whether the app adds watermarks or shows ads, and what it does with the photos you upload. You'll also find the latest version, the minimum Android version, and how to install the official app if your phone has no Play Store. APKPeer lists original apps only. \"Pro unlocked\" builds aren't listed: they're a common way to spread malware, and many of their features run on the developer's servers and don't work anyway.",
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    label: "Streaming and entertainment apps",
    type: "app",
    schemaCategory: "EntertainmentApplication",
    intro:
      "These are official streaming and entertainment apps for Android: places to watch films, series, anime and shows legally. Each page covers what you can watch for free, what needs a subscription, whether the free tier has ads, which regions the service works in, and how much data streaming uses. We also explain the app's sign-in options and how downloads for offline viewing work. APKPeer only lists services that hold the rights to what they stream. Apps built to stream pirated films, TV or live sport aren't listed, because they put your phone and your data at risk and they're routinely taken down.",
  },
  {
    slug: "music-audio",
    name: "Music & Audio",
    label: "Music and audio apps",
    type: "app",
    schemaCategory: "MultimediaApplication",
    intro:
      "Music and audio apps cover streaming services, song recognition, podcasts and audio tools. Each page here explains what the free version includes and what needs a subscription, whether there are ads, how offline listening works, and what the app does with your listening data and microphone access. You'll also find the latest version or update date, the developer's release notes, and how to install the official app if your phone has no Play Store. APKPeer only lists official apps. Modified \"Premium\" builds of music apps aren't listed: they break the service's terms, they can steal your login, and accounts using them get suspended.",
  },
  {
    slug: "video-players",
    name: "Video Players",
    label: "Video player apps",
    type: "app",
    schemaCategory: "MultimediaApplication",
    intro:
      "A good video player plays any file you throw at it, handles subtitles properly, and doesn't fight you with ads. The apps in this category are local and network media players for Android, the kind you use for downloaded videos, files on a USB drive or home server, or streams from your own network. Each page explains which formats and features it supports, whether it's free or ad-supported, whether it's open source, and what permissions it asks for. You'll also find the latest version, the minimum Android version, and how to install the official app from Google Play or the developer.",
  },
  {
    slug: "productivity",
    name: "Productivity",
    label: "Productivity apps",
    type: "app",
    schemaCategory: "BusinessApplication",
    intro:
      "Productivity apps help you get things done: AI assistants, document and note tools, design and office apps. Each page here explains what the app actually does well, what the free plan includes and what needs a subscription, and what happens to the data you put into it, which matters a lot with AI chatbots. You'll also find the latest version, the minimum Android version, the developer's release notes, and how to install the official app if your phone has no Play Store. APKPeer only links to official builds from the developer. Fake \"premium\" versions of popular AI and office apps are a common way to steal accounts.",
  },
  {
    slug: "tools",
    name: "Tools",
    label: "Tools and utilities",
    type: "app",
    schemaCategory: "UtilitiesApplication",
    intro:
      "Tools are the apps that help you run your phone: app stores, installers, file managers and other utilities. Because many of them ask for powerful permissions, such as installing other apps or reading storage, each page here explains which permissions the app requests and why it needs them, who develops it, and whether the code is open source. You'll also find the latest version, the minimum Android version, and how to install it safely if it isn't on Google Play. Some tools in this category are deliberately distributed outside Play, so we link to the developer's official download and explain how to confirm the file is genuine before you install it.",
  },
  {
    slug: "education",
    name: "Education",
    label: "Education apps",
    type: "app",
    schemaCategory: "EducationalApplication",
    intro:
      "Education apps turn spare minutes into practice: a language lesson on the bus, flash cards before an exam, a few math problems at lunch. Each page here explains what the free version actually includes, what a subscription unlocks, how ads and streaks or energy systems shape your progress, and whether lessons work offline. You will also find the latest update date, the Android version you need, and how to install the official app if your phone has no Play Store. APKPeer lists original apps only. Unofficial builds promising free premium features are not listed: they are unsafe and often stop syncing your progress.",
  },
  {
    slug: "shopping",
    name: "Shopping",
    label: "Shopping apps",
    type: "app",
    schemaCategory: "ShoppingApplication",
    intro:
      "Shopping apps are where you type in your address and card details, so installing the genuine app matters more here than almost anywhere else. Each page in this category says who runs the store, where it ships from, how long delivery and returns usually take, and which permissions the app asks for. You will also find the latest version and update date, the minimum Android version, and how to install the official app if your phone has no Play Store. Download shopping apps only from Google Play or the store itself: lookalike apps and fake coupon apps are a common way to steal payment details.",
  },
  {
    slug: "action",
    name: "Action",
    label: "Action games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Action games on Android cover everything from battle royales and party brawlers to platformers built for quick sessions. Each game page explains how the game plays, whether it needs a constant internet connection, what's free and what costs money (battle passes, skins, loot boxes), and whether it shows ads. You'll also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store isn't available on your phone. We don't list mod APKs, aimbots or cheat menus. Online action games scan for them, and accounts that use them get banned, often permanently.",
  },
  {
    slug: "sports",
    name: "Sports",
    label: "Sports games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Sports games on Android are mostly football, with cricket, basketball and racing-style sports alongside. Each page here explains the main modes (career, online matches, ultimate-team style squad building), how much of the game is free, what in-app purchases and random player packs cost, and whether there are ads. We also note how big the game is, which Android version it needs, and what changed in the latest season update. APKPeer lists the official game from the publisher only. Modified builds with free coins or unlocked players aren't listed: they're a common malware carrier, and online modes ban accounts that use them.",
  },
  {
    slug: "adventure",
    name: "Adventure",
    label: "Adventure games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Adventure games on Android let you explore, build and play your own way, from open worlds to platforms full of player-made experiences. Each game page explains what you actually do in the game, whether it's single-player or online, what's free and what costs money, and what parental controls exist, which matters because several of these games are popular with children. You'll also find the latest version, the minimum Android version, and how to install the official game if your phone has no Play Store. We don't list cheat scripts, script executors or \"free currency\" generators. They're a common way to spread malware and to steal accounts, and they get players banned.",
  },
  {
    slug: "arcade",
    name: "Arcade",
    label: "Arcade games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Arcade games are built for short sessions: endless runners, one-tap jumpers and score chasers you can pick up while waiting for a bus. Each game page explains how the game plays, how the ads work (rewarded videos, banners or between runs), what the in-app purchases unlock, and whether you can play offline. You'll also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store isn't available. APKPeer lists the original game from its developer only. Modified builds with free coins or ads removed aren't listed, because they often carry malware and stop getting updates.",
  },
  {
    slug: "racing",
    name: "Racing",
    label: "Racing games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Racing games on Android range from realistic supercar racers with licensed cars to physics-based hill climbers you can play with one thumb. Each page here explains how the game controls, whether it needs a constant connection, how car upgrades and progression work, and what the in-app purchases and random reward packs cost. You'll also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store isn't available. APKPeer lists original games only. Modified builds with free money or every car unlocked aren't listed: they often carry malware, and online racing modes ban accounts that use them.",
  },
  {
    slug: "casual",
    name: "Casual",
    label: "Casual games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Casual games are made to be picked up for a few minutes at a time: fling a bird, spin a slot-style wheel, finish a level and put the phone down. Each page here explains how the game actually plays, how energy, lives or spins limit a session, what the in-app purchases buy, and how often ads appear. You will also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store is not available. APKPeer lists original games only. Builds promising endless spins or free currency are not listed: they are a common source of adware and can get your account banned.",
  },
  {
    slug: "puzzle",
    name: "Puzzle",
    label: "Puzzle games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Puzzle games are built for short breaks: matching candies, sliding blocks or solving a level in a few moves. Each game page here explains how the game works, how lives and boosters affect progress, what the in-app purchases buy, and how the ads are shown. You'll also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store isn't available. APKPeer lists original games only. Builds promising endless lives or free boosters aren't listed: they're a common source of adware, and they stop getting new levels.",
  },
  {
    slug: "strategy",
    name: "Strategy",
    label: "Strategy games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Strategy games reward planning over reflexes: building a base, managing resources, choosing troops and outthinking other players. Each page here explains how the game plays, how long it takes to progress without paying, what the in-app purchases buy (time skips, currency, passes), and how clans and online battles work. You'll also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store isn't available. APKPeer lists the original game from its developer only. Private servers and \"free gems\" builds aren't listed: they're unofficial, often unsafe, and can get your real account banned.",
  },
  {
    slug: "simulation",
    name: "Simulation",
    label: "Simulation games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Simulation games on Android let you drive, park, fly, farm or run a life, with the fun coming from the detail rather than from winning. Each page here explains what you actually do in the game, whether it has an online mode with other players, what the free version includes, and how ads and in-app purchases work. You'll also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store isn't available. APKPeer lists the original game from its developer only. Builds promising free money or every vehicle unlocked aren't listed: they often carry malware, and online modes ban accounts that use them.",
  },
  {
    slug: "board",
    name: "Board",
    label: "Board games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Board games on Android bring classics like Ludo, Snakes and Ladders, carrom and pool to your phone, to play against the computer, with family on one device, or online with friends. Each page here explains the modes available, whether online play needs an account, how the ads work and what in-app purchases buy, and what safety settings matter for chat with strangers. You'll also find the latest update date, the minimum Android version, and how to install the official game if your phone has no Play Store. APKPeer only lists the original game from its developer.",
  },
  {
    slug: "role-playing",
    name: "Role-playing",
    label: "Role-playing games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Role-playing games on Android are some of the biggest downloads you will install: open worlds, long stories and characters you level up over months. Most are free to play and earn money from gacha banners, where you spend premium currency for a random chance at a character or weapon. Each page here explains how the game plays, how its banners and pity system work, how much storage the full download needs, and what phones run it comfortably. You will also find the latest version, what changed in the most recent update, and how to install the official game if Play Store is not available. APKPeer lists the original game from its publisher only.",
  },
  {
    slug: "card",
    name: "Card",
    label: "Card games",
    type: "game",
    schemaCategory: "GameApplication",
    intro:
      "Card games on Android range from digital versions of collectible trading card games to quick solitaire and party games. Each page here explains how matches work, how you get new cards (free daily packs, events or paid packs), what the in-app purchases cost, and whether trading or online battles need an account. You will also find the latest version, what changed in the most recent update, the minimum Android version, and how to install the official game if Play Store is not available. APKPeer lists the original game from its publisher only. Builds promising free packs or unlocked collections are not official, often carry malware, and get accounts banned.",
  },
];

export function categoryLabel(c: Category): string {
  return c.label ?? `${c.name} ${c.type === "game" ? "games" : "apps"}`;
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
