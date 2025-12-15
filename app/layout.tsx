import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipMark - Transform Markdown into Visual Art",
  description: "Create stunning, shareable cards from your Markdown text in seconds. 9+ premium themes, HD export up to 4x, real-time preview. No sign-up required.",
  keywords: ["markdown", "card generator", "social media cards", "image export", "design tool", "content creation", "visual content"],
  authors: [{ name: "Justin Bao" }],
  openGraph: {
    title: "FlipMark - Transform Markdown into Visual Art",
    description: "Create stunning, shareable cards from your Markdown text in seconds. No design skills required.",
    type: "website",
    siteName: "FlipMark",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlipMark - Transform Markdown into Visual Art",
    description: "Create stunning, shareable cards from your Markdown text in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
