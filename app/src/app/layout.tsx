import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { BackgroundScene } from "@/components/BackgroundScene";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Maritime Angler — NB, NS & PEI Fishing Guides",
  description:
    "Species-by-species recreational fishing guides for New Brunswick, Nova Scotia, and Prince Edward Island: identification, seasons, regulations, gear, and technique.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#0e7490",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <BackgroundScene />
        <header className="no-print relative border-b border-border bg-surface sticky top-0 z-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-brand-dark shrink-0">
              <span aria-hidden>🎣</span>
              <span>Maritime Angler</span>
            </Link>
            <HeaderNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-border bg-surface mt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-muted flex flex-col sm:flex-row gap-2 sm:justify-between">
            <p>
              Maritime Angler — recreational fishing reference for New Brunswick, Nova
              Scotia &amp; Prince Edward Island. Not affiliated with DFO or any province.
            </p>
            <p>Always confirm current regulations on the official DFO / provincial sites before you fish.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
