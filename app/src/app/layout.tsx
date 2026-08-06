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
import { getAppearance } from "@/lib/get-appearance";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The three alternative pairings offered in Settings. next/font self-hosts these and
// emits @font-face with `display: swap`; a browser only downloads the faces that
// rendered text actually resolves to, so carrying four options costs nothing to the
// three of them nobody has selected.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
});
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const publicSans = Public_Sans({ variable: "--font-public-sans", subsets: ["latin"] });

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolved on the server so the correct ground is in the very first byte of HTML.
  // Reading it client-side would paint the default theme first and then swap, which on
  // a dark preference is a full-screen white flash on every navigation.
  const { theme, font } = await getAppearance();

  return (
    <html
      lang="en"
      data-theme={theme}
      data-font={font}
      className={`${FONT_VARIABLES} h-full antialiased`}
    >
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
