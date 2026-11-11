/**
 * Free browser-based tools. Each tool has:
 *  - an entry here (metadata, quick answer, FAQ),
 *  - an explanatory article in content/tools/{slug}.mdx,
 *  - a widget registered in components/tools/registry.tsx.
 * Everything runs client-side: files never leave the visitor's device (static hosting, no server).
 * `updated` feeds the sitemap lastmod — bump it when the page text or tool changes.
 */
import { MORE_TOOLS } from "./tools-more.ts";

export type ToolCategory = "image" | "qr" | "text" | "developer" | "calculator" | "converter" | "security" | "device";

export type Tool = {
  slug: string;
  name: string;
  category: ToolCategory;
  /** Meta title (≤ 60 chars incl. " | APKPeer"). */
  title: string;
  /** Meta description, 140–155 chars. */
  description: string;
  /** Quick answer under the H1, 40–65 words. */
  summary: string;
  /** One line for cards and the hub. */
  tagline: string;
  faq: { q: string; a: string }[];
  related: string[];
  updated: string;
};

/** Order here is the order of sections on /tools. */
export const TOOL_CATEGORIES: Record<ToolCategory, string> = {
  image: "Image tools",
  qr: "QR code tools",
  text: "Text tools",
  developer: "Developer tools",
  calculator: "Calculators",
  converter: "Unit converters",
  security: "Security tools",
  device: "Device tools",
};

const BASE_TOOLS: Tool[] = [
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "qr",
    title: "Free QR Code Generator – PNG & SVG, No Sign-up | APKPeer",
    description: "Make a QR code for a link, text or Wi-Fi network in seconds. Pick colors and size, then download it as PNG or SVG. Free, no sign-up, no watermark.",
    summary: "This free QR code generator turns a link, plain text or Wi-Fi login into a QR code instantly. Choose the size, colors and error correction, then download it as a PNG or SVG. It runs entirely in your browser, needs no account, and never adds a watermark or expiry date.",
    tagline: "Links, text and Wi-Fi to QR, as PNG or SVG",
    faq: [
      { q: "Do these QR codes expire?", a: "No. The QR code stores your link or text directly, so it works for as long as the content inside it is valid. There's no redirect service in between, which is how some generators make codes stop working unless you pay." },
      { q: "Can I make a QR code for my Wi-Fi?", a: "Yes. Choose Wi-Fi, enter the network name, password and security type, and download the code. When someone scans it with an Android or iPhone camera, their phone offers to join the network without typing the password." },
      { q: "PNG or SVG: which should I download?", a: "Use PNG for screens, messages and most documents. Use SVG for printing or design software, because it's a vector file that stays sharp at any size, from a business card to a poster." },
      { q: "Why won't my QR code scan?", a: "The most common causes are low contrast, a code printed too small, or too much text packed into it. Keep dark code on a light background, print it at least 2 cm wide, and use a short link for long addresses." },
    ],
    related: ["qr-code-scanner", "password-generator", "image-converter"],
    updated: "2026-11-03",
  },
  {
    slug: "qr-code-scanner",
    name: "QR Code Scanner",
    category: "qr",
    title: "QR Code Scanner Online – Scan From Image or Camera | APKPeer",
    description: "Scan a QR code from a photo, screenshot or your camera, right in your browser. See exactly where a link goes before you open it. Free and private.",
    summary: "This online QR code scanner reads QR codes from a photo, a screenshot or your device's camera. It shows the decoded text or link before anything opens, so you can check where a code leads first. Scanning happens entirely in your browser; images and camera video are never uploaded.",
    tagline: "Read QR codes from images or your camera",
    faq: [
      { q: "Can I scan a QR code from a screenshot?", a: "Yes. Choose Scan an image and pick the screenshot or photo. That's the easiest way to read a QR code that's already on your own screen, which your phone's camera can't point at." },
      { q: "Is it safe to open links from QR codes?", a: "Not always. QR codes can hide phishing links, so this scanner shows the full address first. Check that the domain is what you expect, and never enter passwords or payment details on a page you reached from an unknown code." },
      { q: "Why isn't the camera working?", a: "Your browser asks for camera permission the first time; if you blocked it, allow camera access in the browser's site settings. Camera scanning also needs a secure (https) page, and some in-app browsers block cameras entirely." },
      { q: "Does the scanner save my images?", a: "No. The image is decoded inside your browser and never sent anywhere. Closing the page discards it. That's useful when a QR code contains something private, like a Wi-Fi password." },
    ],
    related: ["qr-code-generator", "apk-hash-checker", "image-converter"],
    updated: "2026-11-03",
  },
  {
    slug: "image-converter",
    name: "Image Converter",
    category: "image",
    title: "Image Converter – JPG, PNG & WebP, Free & Private | APKPeer",
    description: "Convert images between JPG, PNG and WebP in your browser. Batch convert, set quality and download instantly. Free, private and no files uploaded.",
    summary: "This free image converter changes photos and graphics between JPG, PNG and WebP. Add one image or many, pick the output format and quality, and download the results. Conversion runs entirely in your browser, so your images are never uploaded, and there are no watermarks or daily limits.",
    tagline: "JPG, PNG and WebP, in any direction",
    faq: [
      { q: "Which image formats can I convert?", a: "You can convert from JPG (including .jfif), PNG, WebP, GIF and BMP, and save as JPG, PNG or WebP. Animated GIFs are converted using their first frame. Your browser decides which input formats it can open, so very unusual files may not load." },
      { q: "Will converting reduce the quality?", a: "Converting to PNG is lossless. Converting to JPG or WebP uses compression, which you control with the quality slider; 85–92% is usually indistinguishable from the original while making the file much smaller." },
      { q: "Are my images uploaded to a server?", a: "No. The conversion happens inside your browser using its built-in image tools, so files never leave your device. You can even disconnect from the internet after the page loads and it still works." },
      { q: "Can I convert many images at once?", a: "Yes. Select or drop several files and they're all converted to the format you choose. Each one gets its own download button, so you can save just the ones you need." },
    ],
    related: ["png-to-jpg", "webp-to-jpg", "image-compressor"],
    updated: "2026-11-03",
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG Converter",
    category: "image",
    title: "PNG to JPG Converter – Free, Batch & No Upload | APKPeer",
    description: "Convert PNG images to JPG in your browser. Choose quality and background color for transparent areas, batch convert and download. Free, no upload.",
    summary: "This PNG to JPG converter turns PNG images into smaller JPG files in your browser. You can convert several at once, choose the JPG quality, and pick the background color that replaces transparent areas. Nothing is uploaded, there's no sign-up, and the converted files download straight to your device.",
    tagline: "Smaller JPGs from PNGs, with a background color for transparency",
    faq: [
      { q: "What happens to transparent parts of a PNG?", a: "JPG doesn't support transparency, so transparent areas are filled with a background color. White is the default because it suits most documents and websites, but you can pick any color before converting." },
      { q: "Why convert PNG to JPG?", a: "JPG files are usually much smaller than PNGs for photos, which makes them quicker to upload, email and load on websites. Many forms and older apps also only accept JPG files." },
      { q: "Is PNG to JPG conversion lossless?", a: "No. JPG uses lossy compression, so a little detail is removed. At 90% quality the difference is hard to see in photos. For screenshots with sharp text, keep a high quality or stay with PNG." },
      { q: "Is there a file size limit?", a: "There's no fixed limit because nothing is uploaded. Very large images, such as panoramas tens of thousands of pixels wide, can exceed what your browser's memory allows, especially on older phones." },
    ],
    related: ["jpg-to-png", "image-converter", "image-compressor"],
    updated: "2026-11-03",
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG Converter",
    category: "image",
    title: "JPG to PNG Converter – Free, Lossless, No Upload | APKPeer",
    description: "Convert JPG or JPEG images to PNG in your browser. Lossless output, batch conversion and instant downloads. Free, private and no files uploaded.",
    summary: "This JPG to PNG converter turns JPG or JPEG images into PNG files in your browser. Add one image or many and download the PNGs instantly. PNG is lossless, so nothing more is lost when you edit and save again. Your images are never uploaded, and there's no sign-up or watermark.",
    tagline: "Lossless PNGs from JPG and JPEG photos",
    faq: [
      { q: "Does converting JPG to PNG improve quality?", a: "No. Converting can't restore detail that JPG compression already removed. What PNG does is stop further loss: you can edit and re-save a PNG many times without it getting worse, unlike a JPG." },
      { q: "Why is my PNG bigger than the JPG?", a: "PNG is lossless, so it stores every pixel exactly. For photos that usually makes files several times larger. Use PNG when you need editing headroom or transparency later, not to save space." },
      { q: "Will the PNG have a transparent background?", a: "No. A JPG has no transparency, so the PNG keeps the original background. To make the background transparent, open the PNG in an editor and remove it." },
      { q: "Can I convert JFIF files to PNG?", a: "Yes. JFIF is a type of JPEG file, so .jfif images can be added just like .jpg and .jpeg files and saved as PNG." },
    ],
    related: ["png-to-jpg", "image-converter", "image-resizer"],
    updated: "2026-11-03",
  },
  {
    slug: "webp-to-jpg",
    name: "WebP to JPG Converter",
    category: "image",
    title: "WebP to JPG Converter – Free, Batch & No Upload | APKPeer",
    description: "Convert WebP images to JPG in your browser so they open in any app. Batch convert, choose quality and download instantly. Free and nothing uploaded.",
    summary: "This WebP to JPG converter turns WebP images, the format many websites now use, into JPG files that open in any app or photo editor. Convert several at once, choose the quality, and download instantly. It all runs in your browser, so your images are never uploaded and there's no sign-up.",
    tagline: "Turn WebP downloads into JPGs that open anywhere",
    faq: [
      { q: "Why do images save as WebP?", a: "Many websites serve WebP because it's smaller than JPG at the same quality, so pages load faster. When you save an image from those sites, you get the WebP file, which some older apps and upload forms don't accept." },
      { q: "Will I lose quality converting WebP to JPG?", a: "A little, because JPG is lossy too, but at 90% quality the difference is very hard to see. If you need a perfect copy, convert to PNG instead using the image converter, though the file will be larger." },
      { q: "What about transparent WebP images?", a: "JPG can't store transparency, so transparent areas are filled with a background color, white by default. To keep the transparency, convert the WebP to PNG instead." },
      { q: "Can I convert animated WebP files?", a: "Only the first frame is converted, because JPG can't hold animation. To keep an animation, you'd need a GIF or video converter instead." },
    ],
    related: ["image-converter", "png-to-jpg", "image-compressor"],
    updated: "2026-11-03",
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    category: "image",
    title: "Image Compressor – Reduce JPG, PNG & WebP Size | APKPeer",
    description: "Compress images in your browser to reduce file size for email, websites and uploads. See the size saved before downloading. Free, no upload needed.",
    summary: "This image compressor reduces the file size of JPG, PNG and WebP images so they're quicker to upload, email and load on websites. Choose a quality level, see exactly how much smaller each file gets, and download. Compression runs in your browser, so your images are never uploaded to any server.",
    tagline: "Shrink photos for email, upload limits and websites",
    faq: [
      { q: "How much smaller will my image get?", a: "It depends on the image. Phone photos often shrink by 50–80% at 80% quality with little visible change. Images that are already compressed shrink less, and the tool shows the exact before and after sizes." },
      { q: "What quality setting should I use?", a: "Start at 80%. For photos on websites or in emails, 70–80% is usually plenty. For prints or images you'll edit again, use 90% or higher. Compare the preview before downloading." },
      { q: "Why did my PNG get bigger?", a: "PNG is lossless, so it can't be compressed by lowering quality. The compressor saves PNGs as WebP or JPG to make them smaller. If you must keep PNG, resize the image instead, which reduces size a lot." },
      { q: "Does compressing remove location data?", a: "Yes. Re-encoding the image in the browser drops the EXIF metadata, including camera details and GPS location. That's a useful privacy bonus before you share photos online." },
    ],
    related: ["image-resizer", "image-converter", "webp-to-jpg"],
    updated: "2026-11-03",
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    category: "image",
    title: "Image Resizer – Resize Photos by Pixels or Percent | APKPeer",
    description: "Resize images to exact pixel dimensions or by percentage, keeping the aspect ratio. Batch resize JPG, PNG and WebP in your browser. Free, no upload.",
    summary: "This image resizer changes the width and height of JPG, PNG and WebP images, by exact pixels or by percentage, while keeping the aspect ratio if you want. Resize one image or many and download them instantly. It works entirely in your browser, so your photos are never uploaded.",
    tagline: "Exact pixel sizes or a percentage, aspect ratio kept",
    faq: [
      { q: "How do I resize without stretching the image?", a: "Keep Lock aspect ratio switched on, which is the default. When you change the width, the height is calculated automatically, so the image keeps its proportions and nothing looks stretched." },
      { q: "Can I make a small image bigger?", a: "You can, but enlarging can't add detail, so the result looks soft or blurry. Resizing works best for making images smaller, for example to fit an upload limit or a website layout." },
      { q: "What size should a profile picture be?", a: "Most social networks display profile pictures as small squares but accept larger uploads. A square image between 400 and 1080 pixels wide is a safe choice for most platforms." },
      { q: "Does resizing reduce file size?", a: "Yes, usually a lot. Halving the width and height of an image cuts the number of pixels to a quarter, so the file often becomes several times smaller." },
    ],
    related: ["image-compressor", "image-converter", "jpg-to-png"],
    updated: "2026-11-03",
  },
  {
    slug: "apk-hash-checker",
    name: "APK & File SHA-256 Checker",
    category: "security",
    title: "APK SHA-256 Checker – Verify Any File Online | APKPeer",
    description: "Check the SHA-256 hash of an APK or any file in your browser and compare it with the developer's. Spot tampered downloads. Free, nothing uploaded.",
    summary: "This file hash checker calculates the SHA-256, SHA-1 and SHA-512 hashes of an APK or any other file, then compares the result with the hash a developer publishes. A match means your copy is identical to theirs. The file is hashed inside your browser and never uploaded, even for large APKs.",
    tagline: "Verify an APK or any download against its published hash",
    faq: [
      { q: "What does a SHA-256 hash prove?", a: "It proves the file is byte-for-byte identical to the one the hash was made from. If even one byte changes, for example because someone added malware to an APK, the SHA-256 is completely different." },
      { q: "Where do I find the official hash?", a: "Developers that publish hashes usually list them next to the download, on their GitHub releases page, or in a checksums file. On APKPeer, verified files show their SHA-256 on the download page." },
      { q: "Is the file hash the same as the signing certificate?", a: "No. The file hash changes with every version. The signing certificate fingerprint stays the same across a developer's updates and is checked with tools like apksigner. Both together give the strongest assurance." },
      { q: "Can I check large files?", a: "Yes. The file is read in your browser, so large APKs and archives work, but very large files, several gigabytes, may be limited by your device's memory, especially on older phones." },
    ],
    related: ["password-generator", "qr-code-scanner", "image-converter"],
    updated: "2026-11-03",
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    category: "security",
    title: "Strong Password Generator – Random & Secure | APKPeer",
    description: "Generate strong, random passwords in your browser. Choose the length and characters, see the strength, and copy with one tap. Free, nothing stored.",
    summary: "This password generator creates strong, random passwords using your browser's secure random number generator. Choose the length and which characters to include, see an estimate of the strength, and copy the result with one tap. Passwords are generated on your device, never sent anywhere and never stored.",
    tagline: "Strong random passwords, made on your device",
    faq: [
      { q: "How long should a password be?", a: "Use at least 16 characters for important accounts. Length matters more than complexity: a random 16-character password with letters and numbers is far harder to crack than a short one full of symbols." },
      { q: "Is it safe to use an online password generator?", a: "This one is, because the password is created by your browser's secure random generator and never leaves your device. Nothing is sent to a server or saved. You can disconnect from the internet and it still works." },
      { q: "How do I remember strong passwords?", a: "Don't try to. Use a password manager, such as the one built into Android or your browser, to store a different random password for every account. You only need to remember one strong master password." },
      { q: "What does 'exclude ambiguous characters' do?", a: "It removes characters that are easy to confuse, like the letter O and the number 0, or l, 1 and I. That helps when you have to read a password aloud or type it from paper." },
    ],
    related: ["apk-hash-checker", "qr-code-generator", "word-counter"],
    updated: "2026-11-03",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    category: "text",
    title: "Word Counter – Words, Characters & Reading Time | APKPeer",
    description: "Count words, characters, sentences and paragraphs as you type, with reading and speaking time. Free online word counter; your text stays on your device.",
    summary: "This word counter counts words, characters with and without spaces, sentences and paragraphs as you type or paste text. It also estimates reading and speaking time. Everything is counted live in your browser, so your text is never uploaded or saved, which makes it safe for essays, posts and private drafts.",
    tagline: "Words, characters, sentences and reading time, live",
    faq: [
      { q: "How are words counted?", a: "A word is any group of characters separated by spaces or line breaks, the same way most word processors count. Hyphenated words like 'well-known' count as one word, and numbers count as words." },
      { q: "Do characters include spaces?", a: "Both are shown. Many forms and social networks count characters including spaces, while some writing assignments use the count without spaces, so the tool gives you both numbers." },
      { q: "How is reading time calculated?", a: "Reading time assumes about 200 words per minute, a typical silent reading speed. Speaking time assumes about 130 words per minute, which suits presentations and voice-overs." },
      { q: "Is my text saved anywhere?", a: "No. Counting happens in your browser as you type, and nothing is sent to a server or stored. When you close or refresh the page, the text is gone." },
    ],
    related: ["password-generator", "qr-code-generator", "image-compressor"],
    updated: "2026-11-03",
  },
];

/** All tools: the original 11 plus the 50 in tools-more.ts. */
export const TOOLS: Tool[] = [...BASE_TOOLS, ...MORE_TOOLS];

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolsInCategory = (c: ToolCategory) => TOOLS.filter((t) => t.category === c);
