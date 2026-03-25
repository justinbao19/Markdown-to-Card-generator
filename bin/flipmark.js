#!/usr/bin/env node

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const process = require("node:process");
const { marked } = require("marked");
const puppeteer = require("puppeteer");

const THEMES = {
  minimal: {
    name: "Notion Light",
    canvas: "#F3F4F6",
    cardBackground: "#ffffff",
    cardBorder: "#e5e7eb",
    text: "#0f172a",
    muted: "#64748b",
    codeBg: "rgba(15, 23, 42, 0.05)",
    quoteBg: "#f8fafc",
    quoteBorder: "rgba(15, 23, 42, 0.2)",
    shadow: "0 24px 56px rgba(15, 23, 42, 0.12)",
    isDark: false
  },
  obsidian: {
    name: "Dev Dark",
    canvas: "#09090B",
    cardBackground: "#18181B",
    cardBorder: "rgba(255, 255, 255, 0.10)",
    text: "#e2e8f0",
    muted: "#94a3b8",
    codeBg: "rgba(255, 255, 255, 0.08)",
    quoteBg: "rgba(255, 255, 255, 0.03)",
    quoteBorder: "rgba(255, 255, 255, 0.22)",
    shadow: "0 28px 64px rgba(0, 0, 0, 0.5)",
    isDark: true
  },
  aurora: {
    name: "Nebula Glass",
    canvas: "linear-gradient(to bottom right, #faf5ff, #fdf4ff)",
    cardBackground: "linear-gradient(135deg, #f5f3ff, #f5d0fe)",
    cardBorder: "#ddd6fe",
    text: "#3b0764",
    muted: "#6b21a8",
    codeBg: "rgba(109, 40, 217, 0.08)",
    quoteBg: "rgba(109, 40, 217, 0.06)",
    quoteBorder: "rgba(109, 40, 217, 0.25)",
    shadow: "0 24px 56px rgba(126, 34, 206, 0.2)",
    isDark: false
  },
  bamboo: {
    name: "Bamboo Forest",
    canvas: "#fafaf9",
    cardBackground: "#F0FDF4",
    cardBorder: "#86efac",
    text: "#14532d",
    muted: "#15803d",
    codeBg: "rgba(22, 163, 74, 0.1)",
    quoteBg: "rgba(22, 163, 74, 0.06)",
    quoteBorder: "rgba(22, 163, 74, 0.28)",
    shadow: "0 24px 56px rgba(22, 163, 74, 0.25)",
    isDark: false
  },
  sunset: {
    name: "Sunset Vibes",
    canvas: "#f8fafc",
    cardBackground: "linear-gradient(135deg, #fff7ed, #eef2ff)",
    cardBorder: "rgba(251, 146, 60, 0.25)",
    text: "#312e81",
    muted: "#6366f1",
    codeBg: "rgba(79, 70, 229, 0.08)",
    quoteBg: "rgba(79, 70, 229, 0.05)",
    quoteBorder: "rgba(79, 70, 229, 0.2)",
    shadow: "0 24px 56px rgba(79, 70, 229, 0.18)",
    isDark: false
  },
  midnight: {
    name: "Midnight Blue",
    canvas: "#020617",
    cardBackground: "#1E293B",
    cardBorder: "rgba(59, 130, 246, 0.35)",
    text: "#dbeafe",
    muted: "#93c5fd",
    codeBg: "rgba(147, 197, 253, 0.12)",
    quoteBg: "rgba(147, 197, 253, 0.08)",
    quoteBorder: "rgba(147, 197, 253, 0.32)",
    shadow: "0 28px 64px rgba(2, 6, 23, 0.65)",
    isDark: true
  },
  skyblue: {
    name: "Filo Blue",
    canvas: "#F0F9FF",
    cardBackground: "#ffffff",
    cardBorder: "#CCE7FB",
    text: "#1e293b",
    muted: "#0284c7",
    codeBg: "rgba(2, 132, 199, 0.1)",
    quoteBg: "rgba(2, 132, 199, 0.06)",
    quoteBorder: "rgba(2, 132, 199, 0.26)",
    shadow: "0 24px 56px rgba(2, 132, 199, 0.18)",
    isDark: false
  },
  deepocean: {
    name: "Deep Ocean",
    canvas: "#f1f5f9",
    cardBackground: "linear-gradient(135deg, #E0F2FE, #7DD3FC)",
    cardBorder: "rgba(14, 116, 144, 0.25)",
    text: "#0f172a",
    muted: "#0369a1",
    codeBg: "rgba(3, 105, 161, 0.1)",
    quoteBg: "rgba(3, 105, 161, 0.06)",
    quoteBorder: "rgba(3, 105, 161, 0.24)",
    shadow: "0 24px 56px rgba(14, 116, 144, 0.2)",
    isDark: false
  },
  sunsetbloom: {
    name: "Sunset Bloom",
    canvas: "#fff7ed",
    cardBackground: "linear-gradient(135deg, #ffe4e6, #ffedd5)",
    cardBorder: "rgba(244, 63, 94, 0.25)",
    text: "#4c0519",
    muted: "#c2410c",
    codeBg: "rgba(194, 65, 12, 0.1)",
    quoteBg: "rgba(194, 65, 12, 0.06)",
    quoteBorder: "rgba(194, 65, 12, 0.24)",
    shadow: "0 24px 56px rgba(244, 63, 94, 0.18)",
    isDark: false
  }
};

const FONTS = {
  sans: { name: "Sans", family: '"SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  serif: { name: "Serif", family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
  mono: { name: "Mono", family: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace' },
  georgia: { name: "Georgia", family: "Georgia, serif" },
  palatino: { name: "Palatino", family: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
  garamond: { name: "Garamond", family: 'Garamond, "Times New Roman", serif' }
};

const SIZES = {
  sm: { name: "Small", px: 22 },
  base: { name: "Medium", px: 26 },
  lg: { name: "Large", px: 30 },
  xl: { name: "X-Large", px: 36 }
};

const LINE_HEIGHTS = {
  tight: { name: "Tight", value: 1.4 },
  normal: { name: "Normal", value: 1.6 },
  relaxed: { name: "Relaxed", value: 1.8 },
  loose: { name: "Loose", value: 2.0 }
};

const DECORATIONS = {
  none: { name: "None" },
  macos: { name: "macOS" },
  mail: { name: "Filo Mail" },
  browser: { name: "Browser" },
  terminal: { name: "Terminal" },
  notion: { name: "Notion" }
};

const PATTERNS = {
  dots: {
    name: "Dots",
    css: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
    size: "20px 20px"
  },
  grid: {
    name: "Grid",
    css: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
    size: "24px 24px"
  },
  cross: {
    name: "Cross",
    css: "radial-gradient(circle, transparent 14px, #e2e8f0 14px, #e2e8f0 15px, transparent 15px), radial-gradient(circle, #cbd5e1 2px, transparent 2px)",
    size: "32px 32px"
  },
  lines: {
    name: "Lines",
    css: "linear-gradient(#e2e8f0 1px, transparent 1px)",
    size: "100% 20px"
  },
  none: {
    name: "None",
    css: "none",
    size: "0"
  }
};

const FOOTER_ICONS = {
  sparkles: "✦",
  zap: "⚡",
  star: "★",
  heart: "♥",
  rocket: "🚀",
  lightbulb: "💡",
  target: "◎",
  award: "🏆",
  filetext: "📄",
  code: "</>",
  bell: "🔔",
  megaphone: "📣",
  clock: "🕒",
  calendar: "📅",
  trendingup: "↗",
  checkcircle: "✓",
  alertcircle: "!",
  shield: "🛡",
  send: "➤",
  messagesquare: "💬",
  users: "👥",
  globe: "🌐",
  camera: "📷",
  music: "♫",
  package: "📦",
  dollarsign: "$",
  piechart: "◔",
  barchart: "▮▮▮",
  compass: "🧭",
  map: "🗺",
  navigation: "⌖",
  smile: "☺",
  ghost: "👻",
  flame: "🔥",
  coffee: "☕",
  droplets: "💧",
  circle: "○",
  hexagon: "⬡",
  diamond: "◇",
  triangle: "△",
  box: "□",
  layers: "▤",
  apple: "",
  hash: "#"
};

const DEFAULTS = {
  theme: "minimal",
  font: "sans",
  fontSize: "lg",
  lineHeight: "normal",
  decoration: "macos",
  pattern: "dots",
  width: 960,
  padding: 64,
  scale: 2,
  showFooter: true,
  footerText: "FlipMark",
  footerIcon: "sparkles",
  withBackground: true
};

const SHORT_OPTIONS = {
  "-h": "--help",
  "-i": "--input",
  "-m": "--markdown",
  "-o": "--output",
  "-t": "--theme",
  "-w": "--width",
  "-p": "--padding",
  "-s": "--scale",
  "-f": "--font"
};

function printHelp() {
  console.log(`\nFlipMark CLI - Full style controls from terminal\n\nUsage:\n  flipmark -i ./note.md -o ./card.png\n  flipmark --markdown "# Hello" --theme aurora --decoration browser\n  cat note.md | flipmark --theme obsidian --pattern grid\n\nCore:\n  -i, --input <file>            Markdown file path\n  -m, --markdown <text>         Markdown text input\n  -o, --output <file>           Output PNG path\n\nStyle (same direction as web controls):\n  -t, --theme <name>            Theme key (default: minimal)\n  -f, --font <name>             Font family (default: sans)\n      --font-size <name>        sm | base | lg | xl (default: lg)\n      --line-height <name>      tight | normal | relaxed | loose (default: normal)\n      --decoration <name>       none | macos | mail | browser | terminal | notion\n      --pattern <name>          dots | grid | cross | lines | none\n      --footer / --no-footer    Toggle footer (default: footer on)\n      --footer-text <text>      Footer text (default: FlipMark)\n      --footer-icon <name>      Footer icon key (default: sparkles)\n      --with-background         Export canvas + pattern (default)\n      --card-only               Export card only\n\nOutput:\n  -w, --width <px>              Card width in px (default: 960)\n  -p, --padding <px>            Canvas padding in px (default: 64)\n  -s, --scale <n>               Output scale 1-4 (default: 2)\n\nLists:\n      --list-themes\n      --list-fonts\n      --list-sizes\n      --list-line-heights\n      --list-decorations\n      --list-patterns\n      --list-footer-icons\n\n  -h, --help                    Show this help\n`);
}

function parseNumber(value, fallback, { min, max, label }) {
  if (value === undefined) return fallback;
  const num = Number(value);
  if (!Number.isFinite(num)) throw new Error(`${label} must be a number`);
  if (num < min || num > max) throw new Error(`${label} must be between ${min} and ${max}`);
  return num;
}

function normalizeArg(token) {
  return SHORT_OPTIONS[token] || token;
}

function parseArgs(argv) {
  const args = {
    theme: DEFAULTS.theme,
    font: DEFAULTS.font,
    fontSize: DEFAULTS.fontSize,
    lineHeight: DEFAULTS.lineHeight,
    decoration: DEFAULTS.decoration,
    pattern: DEFAULTS.pattern,
    width: DEFAULTS.width,
    padding: DEFAULTS.padding,
    scale: DEFAULTS.scale,
    showFooter: DEFAULTS.showFooter,
    footerText: DEFAULTS.footerText,
    footerIcon: DEFAULTS.footerIcon,
    withBackground: DEFAULTS.withBackground
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = normalizeArg(argv[i]);

    if (token === "--help") {
      args.help = true;
      continue;
    }

    if (token === "--list-themes") { args.listThemes = true; continue; }
    if (token === "--list-fonts") { args.listFonts = true; continue; }
    if (token === "--list-sizes") { args.listSizes = true; continue; }
    if (token === "--list-line-heights") { args.listLineHeights = true; continue; }
    if (token === "--list-decorations") { args.listDecorations = true; continue; }
    if (token === "--list-patterns") { args.listPatterns = true; continue; }
    if (token === "--list-footer-icons") { args.listFooterIcons = true; continue; }

    if (token === "--input") {
      args.input = argv[++i];
      continue;
    }

    if (token === "--markdown") {
      args.markdown = argv[++i];
      continue;
    }

    if (token === "--output") {
      args.output = argv[++i];
      continue;
    }

    if (token === "--theme") {
      args.theme = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--font") {
      args.font = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--font-size") {
      args.fontSize = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--line-height") {
      args.lineHeight = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--decoration") {
      args.decoration = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--pattern") {
      args.pattern = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--footer") {
      args.showFooter = true;
      continue;
    }

    if (token === "--no-footer") {
      args.showFooter = false;
      continue;
    }

    if (token === "--footer-text") {
      args.footerText = argv[++i] || DEFAULTS.footerText;
      continue;
    }

    if (token === "--footer-icon") {
      args.footerIcon = (argv[++i] || "").toLowerCase();
      continue;
    }

    if (token === "--with-background") {
      args.withBackground = true;
      continue;
    }

    if (token === "--card-only") {
      args.withBackground = false;
      continue;
    }

    if (token === "--width") {
      args.width = parseNumber(argv[++i], args.width, { min: 480, max: 3000, label: "width" });
      continue;
    }

    if (token === "--padding") {
      args.padding = parseNumber(argv[++i], args.padding, { min: 0, max: 400, label: "padding" });
      continue;
    }

    if (token === "--scale") {
      args.scale = parseNumber(argv[++i], args.scale, { min: 1, max: 4, label: "scale" });
      continue;
    }

    throw new Error(`Unknown option: ${argv[i]}`);
  }

  return args;
}

function printList(title, source) {
  console.log(`${title}:`);
  Object.entries(source).forEach(([key, value]) => {
    const label = value && value.name ? value.name : value;
    console.log(`  - ${key}${label ? ` (${label})` : ""}`);
  });
}

function runListMode(args) {
  if (args.listThemes) { printList("Themes", THEMES); return true; }
  if (args.listFonts) { printList("Fonts", FONTS); return true; }
  if (args.listSizes) { printList("Sizes", SIZES); return true; }
  if (args.listLineHeights) { printList("Line heights", LINE_HEIGHTS); return true; }
  if (args.listDecorations) { printList("Decorations", DECORATIONS); return true; }
  if (args.listPatterns) { printList("Patterns", PATTERNS); return true; }
  if (args.listFooterIcons) {
    console.log("Footer icons:");
    Object.entries(FOOTER_ICONS).forEach(([key, glyph]) => console.log(`  - ${key} (${glyph})`));
    return true;
  }
  return false;
}

function getDefaultOutputPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.resolve(process.cwd(), `flipmark-${stamp}.png`);
}

async function readInputContent(args) {
  if (args.markdown) return args.markdown;

  if (args.input) {
    const inputPath = path.resolve(process.cwd(), args.input);
    return fsp.readFile(inputPath, "utf8");
  }

  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf8");
  }

  throw new Error("Provide markdown via --input, --markdown, or stdin");
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveChromeExecutable() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium"
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function getDecorationHtml(decoration) {
  if (decoration === "none") return "";
  if (decoration === "macos") {
    return `<div class="window-header"><div class="macos"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div></div>`;
  }
  if (decoration === "mail") {
    return `<div class="window-header"><div class="mail"><span class="badge">Filo Mail</span><span class="meta">Inbox · To: you@filomail.com</span></div></div>`;
  }
  if (decoration === "browser") {
    return `<div class="window-header"><div class="browser"><div class="macos small"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><div class="url">🔒 filomail.com</div></div></div>`;
  }
  if (decoration === "terminal") {
    return `<div class="window-header"><div class="terminal"><div class="macos mini"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><span class="term-label">▸ zsh</span></div></div>`;
  }
  return `<div class="window-header"><div class="notion">📄 Workspace › Page</div></div>`;
}

function buildHtml({ markdownHtml, options }) {
  const theme = THEMES[options.theme];
  const font = FONTS[options.font];
  const size = SIZES[options.fontSize];
  const lineHeight = LINE_HEIGHTS[options.lineHeight].value;
  const pattern = PATTERNS[options.pattern];
  const footerGlyph = FOOTER_ICONS[options.footerIcon] || FOOTER_ICONS.sparkles;

  const bodyPadding = options.withBackground ? options.padding : 0;
  const canvasBackground = options.withBackground ? theme.canvas : "transparent";
  const patternOpacity = theme.isDark ? 0.15 : 1;
  const decorationHtml = getDecorationHtml(options.decoration);

  const footerHtml = options.showFooter
    ? `<div class="footer"><span class="icon">${escapeHtml(footerGlyph)}</span><span class="label">${escapeHtml(options.footerText)}</span></div>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: ${canvasBackground};
    min-height: 100vh;
    padding: ${bodyPadding}px;
    position: relative;
    font-family: ${font.family};
  }

  .pattern-overlay {
    position: fixed;
    inset: 0;
    background-image: ${pattern.css};
    background-size: ${pattern.size};
    opacity: ${options.withBackground && options.pattern !== "none" ? patternOpacity : 0};
    pointer-events: none;
  }

  .card-wrap {
    position: relative;
    z-index: 1;
    width: ${options.width}px;
    max-width: 100%;
    margin: 0 auto;
  }

  .card {
    width: 100%;
    min-height: 300px;
    border-radius: 16px;
    padding: 48px;
    background: ${theme.cardBackground};
    border: 1px solid ${theme.cardBorder};
    color: ${theme.text};
    box-shadow: ${theme.shadow};
  }

  .window-header {
    margin-bottom: 32px;
    min-height: 24px;
    display: flex;
    align-items: center;
  }

  .macos { display: inline-flex; gap: 8px; }
  .macos.small { gap: 6px; }
  .macos.mini { gap: 5px; }
  .dot { width: 12px; height: 12px; border-radius: 999px; display: inline-block; }
  .macos.small .dot { width: 10px; height: 10px; }
  .macos.mini .dot { width: 8px; height: 8px; }
  .dot.red { background: #FF5F57; }
  .dot.yellow { background: #FEBC2E; }
  .dot.green { background: #28C840; }

  .mail { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 8px; gap: 12px; }
  .badge { font-size: 12px; font-weight: 700; }
  .meta { font-size: 10px; opacity: 0.6; text-align: right; }

  .browser { display: flex; align-items: center; gap: 10px; width: 100%; }
  .url { flex: 1; height: 30px; border-radius: 10px; background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; }

  .terminal { width: 100%; border-radius: 10px; background: rgba(0,0,0,0.82); color: #fff; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; }
  .term-label { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 11px; opacity: 0.85; }

  .notion { font-size: 12px; opacity: 0.78; font-weight: 600; }

  .markdown {
    font-size: ${size.px}px;
    line-height: ${lineHeight};
    font-weight: 500;
    word-break: break-word;
  }
  .markdown > *:first-child { margin-top: 0; }
  .markdown > *:last-child { margin-bottom: 0; }
  .markdown h1, .markdown h2, .markdown h3 {
    font-weight: 700;
    line-height: 1.25;
    margin: 0.9em 0 0.5em;
    letter-spacing: -0.02em;
  }
  .markdown h1 { font-size: 1.55em; }
  .markdown h2 { font-size: 1.28em; }
  .markdown h3 { font-size: 1.14em; }
  .markdown p, .markdown ul, .markdown ol, .markdown blockquote, .markdown pre { margin: 0.72em 0; }
  .markdown ul, .markdown ol { padding-left: 1.2em; }
  .markdown li::marker { opacity: 0.55; }
  .markdown code {
    background: ${theme.codeBg};
    border-radius: 6px;
    padding: 0.12em 0.35em;
    font-size: 0.86em;
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-weight: 400;
  }
  .markdown pre {
    background: ${theme.codeBg};
    border: 1px solid ${theme.cardBorder};
    border-radius: 10px;
    padding: 16px 18px;
    overflow-x: auto;
  }
  .markdown pre code {
    background: transparent;
    border: 0;
    padding: 0;
  }
  .markdown blockquote {
    background: ${theme.quoteBg};
    border-left: 4px solid ${theme.quoteBorder};
    padding: 12px 16px;
    border-radius: 8px;
    opacity: 0.9;
    font-style: italic;
  }
  .markdown a { color: ${theme.muted}; text-decoration-thickness: 2px; text-underline-offset: 3px; }
  .markdown hr { border: 0; border-top: 1px solid ${theme.cardBorder}; margin: 1em 0; }

  .footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid rgba(0,0,0,0.08);
    opacity: 0.5;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: "SF Pro Display", "Segoe UI", sans-serif;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-size: 10px;
  }
  .footer .icon { font-size: 13px; line-height: 1; }

  ${theme.isDark ? ".footer{border-top-color: rgba(255,255,255,0.12);}" : ""}
</style>
</head>
<body>
  <div class="pattern-overlay"></div>
  <div class="card-wrap">
    <article id="card" class="card">
      ${decorationHtml}
      <div class="markdown">${markdownHtml}</div>
      ${footerHtml}
    </article>
  </div>
</body>
</html>`;
}

async function ensureDirForFile(filePath) {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
}

async function renderPng({ html, outputPath, width, padding, scale, withBackground }) {
  const viewportWidth = Math.max(640, width + (withBackground ? padding * 2 : 0));
  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  };

  const executablePath = resolveChromeExecutable();
  if (executablePath) launchOptions.executablePath = executablePath;

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: viewportWidth, height: 1000, deviceScaleFactor: scale });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");

    if (withBackground) {
      await page.screenshot({ path: outputPath, type: "png", fullPage: true, omitBackground: false });
      return;
    }

    const clip = await page.evaluate(() => {
      const card = document.getElementById("card");
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      return {
        x: Math.max(0, Math.floor(rect.x)),
        y: Math.max(0, Math.floor(rect.y)),
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height)
      };
    });

    if (!clip || clip.width <= 0 || clip.height <= 0) {
      throw new Error("Failed to capture card bounds");
    }

    await page.screenshot({
      path: outputPath,
      type: "png",
      clip,
      omitBackground: true
    });
  } finally {
    await browser.close();
  }
}

function validateChoice(name, value, source) {
  if (!source[value]) {
    throw new Error(`Invalid ${name}: ${value}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (runListMode(args)) return;

  validateChoice("theme", args.theme, THEMES);
  validateChoice("font", args.font, FONTS);
  validateChoice("font-size", args.fontSize, SIZES);
  validateChoice("line-height", args.lineHeight, LINE_HEIGHTS);
  validateChoice("decoration", args.decoration, DECORATIONS);
  validateChoice("pattern", args.pattern, PATTERNS);
  validateChoice("footer-icon", args.footerIcon, FOOTER_ICONS);

  const markdown = (await readInputContent(args)).trim();
  if (!markdown) throw new Error("Markdown content is empty");

  marked.setOptions({ gfm: true, breaks: true });
  const markdownHtml = await marked.parse(markdown);

  const html = buildHtml({ markdownHtml, options: args });
  const outputPath = path.resolve(process.cwd(), args.output || getDefaultOutputPath());
  await ensureDirForFile(outputPath);

  await renderPng({
    html,
    outputPath,
    width: args.width,
    padding: args.padding,
    scale: args.scale,
    withBackground: args.withBackground
  });

  console.log(`[flipmark] Generated: ${outputPath}`);
}

main().catch((error) => {
  if (String(error && error.message).includes("Could not find Chrome")) {
    console.error("[flipmark] Chrome executable was not found.");
    console.error("[flipmark] Fix options:");
    console.error("  1) Install Chrome/Chromium locally");
    console.error("  2) Or run: npx puppeteer browsers install chrome");
    console.error("  3) Or set PUPPETEER_EXECUTABLE_PATH=/path/to/chrome");
  }
  console.error(`[flipmark] ${error.message}`);
  process.exit(1);
});
