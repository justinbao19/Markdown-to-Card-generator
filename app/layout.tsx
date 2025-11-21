import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Markdown to Card Generator",
  description: "将 Markdown 转换为精美卡片",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


