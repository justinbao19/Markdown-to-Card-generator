# Markdown to Card Generator 🎨

A modern, aesthetic tool that turns your Markdown text into beautiful, shareable social media cards. Built with Next.js 16, React 19, and Tailwind CSS.

<!-- ![Project Preview](./public/preview.png) -->
<!-- *(Note: Add a screenshot of your app here)* -->

## ✨ Features

- **📝 Real-time Editing**: Type Markdown on the left, see the changes instantly on the right.
- **🎨 3 Stunning Themes**:
  - **Notion Light**: Clean, minimal, and professional.
  - **Dev Dark**: High-contrast dark mode for developers.
  - **OpenAI Glass**: Modern glassmorphism with gradient backgrounds.
- **🔍 Interactive Preview**:
  - **Zoom Controls**: Use the slider or buttons to zoom in/out (50% - 150%).
  - **Scrollable Canvas**: Easily handle long content without cropping.
- **🖼️ High-Quality Export**: One-click export to HD PNG (Retina/2x pixel ratio).
- **💅 Beautiful Typography**: Powered by `@tailwindcss/typography` for perfect reading rhythm.
- **🎛️ Customization**: Toggle window controls (macOS style traffic lights) on/off.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Core Logic**:
  - `react-markdown`: For safe and easy Markdown parsing.
  - `html-to-image`: For generating the image output.
  - `clsx` & `tailwind-merge`: For dynamic class handling.

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed (v18+ recommended).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/markdown-to-card-generator.git
   cd markdown-to-card-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app running.

## 📖 Usage

1. **Write**: Enter your content in the left-hand Markdown editor.
2. **Style**: Use the floating toolbar at the bottom to:
   - Switch themes.
   - Toggle window decorations.
   - Zoom in or out to adjust the view.
3. **Export**: Click the **Export** button to save your card as a PNG image.

## 📂 Project Structure

```bash
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles & Tailwind directives
├── components/
│   └── CardGenerator.tsx # Main application logic & UI
├── public/             # Static assets
├── tailwind.config.ts  # Tailwind configuration
└── package.json        # Dependencies
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [ISC License](LICENSE).
