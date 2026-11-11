import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Widget for each tool slug. next/dynamic splits every widget into its own chunk,
 * so a page only downloads the code for its own tool (the QR libraries stay on QR pages).
 */
const ImageTool = dynamic(() => import("./ImageTool"));
const QrGenerator = dynamic(() => import("./QrGenerator"));
const QrScanner = dynamic(() => import("./QrScanner"));
const HashChecker = dynamic(() => import("./HashChecker"));
const PasswordGenerator = dynamic(() => import("./PasswordGenerator"));
const WordCounter = dynamic(() => import("./WordCounter"));
const TextTool = dynamic(() => import("./TextTool"));
const DevTools = dynamic(() => import("./DevTools"));
const Calculators = dynamic(() => import("./Calculators"));
const UnitConverter = dynamic(() => import("./UnitConverter"));
const ImageExtras = dynamic(() => import("./ImageExtras"));
const DeviceTools = dynamic(() => import("./DeviceTools"));

export const TOOL_WIDGETS: Record<string, ComponentType> = {
  "qr-code-generator": () => <QrGenerator />,
  "qr-code-scanner": () => <QrScanner />,
  "image-converter": () => <ImageTool mode="convert" defaultFormat="image/png" />,
  "png-to-jpg": () => <ImageTool mode="convert" defaultFormat="image/jpeg" lockFormat accept="image/png,.png" dropLabel="Choose PNG images" />,
  "jpg-to-png": () => (
    <ImageTool mode="convert" defaultFormat="image/png" lockFormat accept="image/jpeg,.jpg,.jpeg,.jfif" dropLabel="Choose JPG images" />
  ),
  "webp-to-jpg": () => <ImageTool mode="convert" defaultFormat="image/jpeg" lockFormat accept="image/webp,.webp" dropLabel="Choose WebP images" />,
  "image-compressor": () => <ImageTool mode="compress" />,
  "image-resizer": () => <ImageTool mode="resize" />,
  "apk-hash-checker": () => <HashChecker />,
  "password-generator": () => <PasswordGenerator />,
  "word-counter": () => <WordCounter />,

  // Text
  "case-converter": () => <TextTool kind="case" />,
  "remove-duplicate-lines": () => <TextTool kind="dedupe" />,
  "sort-lines": () => <TextTool kind="sort" />,
  "remove-line-breaks": () => <TextTool kind="linebreaks" />,
  "remove-extra-spaces": () => <TextTool kind="spaces" />,
  "reverse-text": () => <TextTool kind="reverse" />,
  "slug-generator": () => <TextTool kind="slug" />,
  "find-and-replace": () => <TextTool kind="findreplace" />,
  "text-repeater": () => <TextTool kind="repeat" />,
  "lorem-ipsum-generator": () => <DevTools kind="lorem" />,
  "text-to-speech": () => <DeviceTools kind="tts" />,
  "binary-translator": () => <TextTool kind="binary" />,
  "morse-code-translator": () => <TextTool kind="morse" />,
  // Developer
  "base64-encoder-decoder": () => <TextTool kind="base64" />,
  "url-encoder-decoder": () => <TextTool kind="url" />,
  "json-formatter": () => <TextTool kind="json" />,
  "hash-generator": () => <DevTools kind="hash" />,
  "uuid-generator": () => <DevTools kind="uuid" />,
  "timestamp-converter": () => <DevTools kind="timestamp" />,
  "number-base-converter": () => <DevTools kind="base" />,
  "color-converter": () => <DevTools kind="color" />,
  "random-number-generator": () => <DevTools kind="random" />,
  "random-name-picker": () => <DevTools kind="picker" />,
  "roman-numeral-converter": () => <DevTools kind="roman" />,
  // Calculators
  "age-calculator": () => <Calculators kind="age" />,
  "bmi-calculator": () => <Calculators kind="bmi" />,
  "percentage-calculator": () => <Calculators kind="percentage" />,
  "discount-calculator": () => <Calculators kind="discount" />,
  "tip-calculator": () => <Calculators kind="tip" />,
  "loan-emi-calculator": () => <Calculators kind="loan" />,
  "compound-interest-calculator": () => <Calculators kind="compound" />,
  "date-difference-calculator": () => <Calculators kind="datediff" />,
  "sales-tax-calculator": () => <Calculators kind="salestax" />,
  // Unit converters
  "length-converter": () => <UnitConverter kind="length" />,
  "weight-converter": () => <UnitConverter kind="weight" />,
  "temperature-converter": () => <UnitConverter kind="temperature" />,
  "data-storage-converter": () => <UnitConverter kind="data" />,
  "speed-converter": () => <UnitConverter kind="speed" />,
  "area-converter": () => <UnitConverter kind="area" />,
  // Image
  "jpg-to-webp": () => <ImageTool mode="convert" defaultFormat="image/webp" lockFormat accept="image/jpeg,.jpg,.jpeg,.jfif" dropLabel="Choose JPG images" />,
  "png-to-webp": () => <ImageTool mode="convert" defaultFormat="image/webp" lockFormat accept="image/png,.png" dropLabel="Choose PNG images" />,
  "webp-to-png": () => <ImageTool mode="convert" defaultFormat="image/png" lockFormat accept="image/webp,.webp" dropLabel="Choose WebP images" />,
  "image-rotator": () => <ImageTool mode="rotate" />,
  "black-and-white-image": () => <ImageTool mode="grayscale" />,
  "image-to-base64": () => <ImageExtras kind="base64" />,
  "favicon-generator": () => <ImageExtras kind="favicon" />,
  "image-color-picker": () => <ImageExtras kind="colorpicker" />,
  // Device
  "screen-resolution-checker": () => <DeviceTools kind="screen" />,
  "what-is-my-device": () => <DeviceTools kind="device" />,
  "online-stopwatch": () => <DeviceTools kind="stopwatch" />,
};
