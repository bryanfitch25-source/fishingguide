import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Fraunces,
  Source_Sans_3,
  Bricolage_Grotesque,
  Public_Sans,
} from "next/font/google";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { BackgroundScene } from "@/components/BackgroundScene";
import { PWARegister } from "@/components/PWARegister";
import { BackButton } from "@/components/BackButton";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The three alternative pairings offered in Settings.
//
// preload:false on all of them. next/font preloads by default, which emitted a
// <link rel=preload> for all eight faces and had every visitor download 191 KB of
// fonts on every page — for three pairings nobody had selected. With preload off they
// are fetched only when the CSS actually resolves to them, i.e. once, on the deliberate
// act of choosing one. Geist keeps its preload, since it is the default and is always
// the face in use until someone changes it.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  preload: false,
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
  preload: false,
});
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], preload: false });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"], preload: false });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], preload: false });
const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"], preload: false });

const FONT_VARIABLES = [
  geistSans.variable,
  geistMono.variable,
  plexSans.variable,
  plexMono.variable,
  fraunces.variable,
  sourceSans.variable,
  bricolage.variable,
  publicSans.variable,
].join(" ");

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
  appleWebApp: {
    capable: true,
    title: "Maritime Angler",
    // Lets the page paint behind the status bar, which is what gives the safe-area
    // insets something to inset from.
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#0e7490",
  // Required for env(safe-area-inset-*) to resolve to anything but zero once the app is
  // installed to the iPhone Home Screen — without it the fixed quick-log button sits
  // underneath the home indicator.
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No appearance read here on purpose. Resolving it server-side meant a cookie read in
  // the layout, which opted every route beneath it out of static rendering — the whole
  // public guide stopped being served from the CDN. ThemeScript applies it from the
  // client before first paint instead; see that file for why it has to be inline.
  return (
    <html lang="en" className={`${FONT_VARIABLES} h-full antialiased`}>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <BackgroundScene />
        {/* Installed to an iPhone Home Screen the page runs full-bleed under the status
            bar (viewport-fit=cover + black-translucent), so the header has to reserve
            that height itself or the clock lands on top of the title. Padding rather
            than a margin, so the header's own background fills the status bar area
            instead of leaving a transparent strip showing the scenery behind it. */}
        <header
          className="no-print relative border-b border-border bg-surface sticky top-0 z-20"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-1">
              <BackButton />
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-base sm:text-lg text-brand-dark shrink-0"
              >
                <span aria-hidden>🎣</span>
                <span>Maritime Angler</span>
              </Link>
            </div>
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
