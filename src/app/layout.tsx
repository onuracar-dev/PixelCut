import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/components/arc/foundation.css";
import "./globals.css";
import { AppearanceProvider } from "@/lib/appearance";
import { APPEARANCE_BOOT_SCRIPT } from "@/lib/appearance-script";

export const metadata: Metadata = {
  title: "PixelCut • İleri CSS Lab & Dilimleme Stüdyosu",
  description: "Piksel hassasiyetinde bileşen dilimleme, CSS hijyen denetimi ve canlı laboratuvar platformu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased dark`}
      data-theme="oled"
      data-accent="blue"
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme / data-accent before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=JetBrains+Mono:ital,wght@0,400..700;1,400..700&display=swap"
        />
        <link
          rel="preload"
          href="/fonts/geist/Geist-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist/GeistMono-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/fira-code/FiraCode-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-label">
        <AppearanceProvider>{children}</AppearanceProvider>
      </body>
    </html>
  );
}
