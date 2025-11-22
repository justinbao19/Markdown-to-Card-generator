import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipMark - Markdown to Card Generator",
  description: "Turn your Markdown into beautiful, shareable social media cards. Features real-time preview, stunning themes, zoom controls, and HD export.",
  keywords: ["markdown", "card generator", "social media", "image export", "design tool"],
  authors: [{ name: "Justin Bao" }],
  openGraph: {
    title: "FlipMark - Markdown to Card Generator",
    description: "Create aesthetic cards from Markdown text instantly",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


