# FlipMark ✨

**Turn Markdown into beautiful, shareable cards in seconds.**

A modern, feature-rich tool that transforms your Markdown content into stunning social media cards. Perfect for developers, writers, and content creators who want to share their ideas visually.

🔗 **Live Demo**: [flipmark.vercel.app](https://flipmark.vercel.app)

---

## 🎯 What is FlipMark?

FlipMark is a web-based card generator that lets you:
- Write content in **Markdown** or **Visual (WYSIWYG)** mode
- Customize the look with **9 themes**, **6 fonts**, and **5 canvas patterns**
- Export as **high-resolution PNG** images
- **Share directly to X (Twitter)** with one click

---

## ✨ Features

### 📝 Dual Editor Modes
| Mode | Description |
|------|-------------|
| **Markdown** | Write in plain Markdown with syntax highlighting |
| **Visual** | Notion-style WYSIWYG editor powered by Novel |

### 🎨 9 Beautiful Themes
- **Notion Light** – Clean, minimal, professional
- **Dev Dark** – High-contrast dark mode for developers
- **Nebula Glass** – Modern glassmorphism with purple gradients
- **Bamboo Forest** – Fresh green, nature-inspired
- **Sunset Vibes** – Warm orange to indigo gradient
- **Midnight Blue** – Deep blue, elegant dark theme
- **Filo Blue** – Bright sky blue, friendly feel
- **Deep Ocean** – Gradient blue, ocean-inspired
- **Sunset Bloom** – Rose to orange, warm tones

### 🔤 Typography Controls
- **6 Font Families**: Sans, Serif, Mono, Georgia, Palatino, Garamond
- **4 Font Sizes**: Small, Medium, Large, X-Large
- **4 Line Heights**: Tight, Normal, Relaxed, Loose

### 🪟 Window Decorations
Choose from 6 window styles to match your content:
- **None** – Clean, no decoration
- **macOS** – Classic traffic light buttons
- **Filo Mail** – Email client style
- **Browser** – Safari-style address bar
- **Terminal** – Command line aesthetic
- **Notion** – Breadcrumb navigation style

### 🎭 Canvas Patterns
Add visual texture to your background:
- Dots, Grid, Cross, Lines, or None

### 🏷️ Customizable Footer
- Toggle footer on/off
- Custom text
- **60+ icons** to choose from (Lucide icon set)

### 📤 Export Options
- **Preview** before exporting
- **Multiple resolutions**: 1x, 2x (Retina), 3x, 4x (Ultra HD)
- **With or without background** – export full canvas or card only

### 🐦 Share to X (Twitter)
- One-click share to X
- Auto-copies image to clipboard
- Pre-filled share text with FlipMark link
- Choose to share with background or card only

### 🌓 Dark Mode
- System preference detection
- Manual toggle available
- Persisted in localStorage

### 📱 Responsive Design
- Works on desktop and mobile
- Touch-friendly pinch-to-zoom on mobile
- Adaptive layout for different screen sizes

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Editor** | [Novel](https://novel.sh/) (Notion-style WYSIWYG) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Markdown** | `react-markdown` |
| **Image Export** | `html-to-image` |
| **Syntax Highlighting** | `lowlight` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
# Clone the repository
git clone https://github.com/user/flipmark.git
cd flipmark

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage

### 1. Write Your Content
- Switch between **Markdown** and **Visual** mode using the toggle
- Use standard Markdown syntax: `# Heading`, `**bold**`, `*italic*`, `> quote`, `- list`

### 2. Customize the Style
- **Theme**: Choose from 9 color schemes
- **Typography**: Select font family, size, and line height
- **Appearance**: Pick window decoration, canvas pattern, and footer settings

### 3. Preview & Export
- Click **Preview** to see the final result
- Click **Export** to download as PNG (choose resolution and background option)

### 4. Share to X
- Click **Share** button
- Choose "With Background" or "Card Only"
- Image is copied to clipboard automatically
- Paste (Cmd/Ctrl+V) in the X compose window

---

## 💻 CLI Usage (New)

Web UI is still fully available. CLI is an additional entry point for agent/terminal workflows.

### Quick Start

```bash
# Generate card from a markdown file
npm run card -- -i ./note.md -o ./output/card.png

# Or pass markdown text directly
npm run card -- --markdown "# Hello\nThis is a card" --theme ocean

# Or pipe from stdin
cat ./note.md | npm run card -- -o ./output/card.png
```

### CLI Options

```bash
npm run card:help
npm run card -- --list-themes
npm run card -- --list-fonts
```

Key style flags:
- `--theme` (9 themes): `minimal`, `obsidian`, `aurora`, `bamboo`, `sunset`, `midnight`, `skyblue`, `deepocean`, `sunsetbloom`
- `--font`: `sans`, `serif`, `mono`, `georgia`, `palatino`, `garamond`
- `--font-size`: `sm`, `base`, `lg`, `xl`
- `--line-height`: `tight`, `normal`, `relaxed`, `loose`
- `--decoration`: `none`, `macos`, `mail`, `browser`, `terminal`, `notion`
- `--pattern`: `dots`, `grid`, `cross`, `lines`, `none`
- `--footer` / `--no-footer`, `--footer-text`, `--footer-icon`
- `--with-background` / `--card-only`

---

## 📂 Project Structure

```
├── app/
│   ├── layout.tsx        # Root layout with metadata
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles & Tailwind
│   └── icon.tsx          # Dynamic favicon
├── components/
│   ├── CardGenerator.tsx # Main application component
│   └── NovelEditor.tsx   # WYSIWYG editor wrapper
├── public/
│   └── assets/           # Static assets
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to branch (`git push origin feature/awesome`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

## 🙏 Acknowledgments

- [Novel](https://novel.sh/) for the amazing WYSIWYG editor
- [Lucide](https://lucide.dev/) for the beautiful icon set
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

---

<p align="center">
  Made with ❤️ by <a href="https://x.com/JustinBao_">@JustinBao_</a>
</p>
