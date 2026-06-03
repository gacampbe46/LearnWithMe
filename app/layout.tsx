import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Inter } from "next/font/google";
import { Suspense } from "react";
import {
  HomeAccountControl,
  HomeAccountFallback,
} from "@/components/home/home-account-control";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://learnwithme.fyi"),
  title: "learnwithme",
  description:
    "Programs and sessions from creators you trust — curated around the people behind the skill.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${cormorant.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <div className="pointer-events-none fixed left-4 top-4 z-50 sm:left-6 sm:top-6">
            <div className="pointer-events-auto">
              <Suspense fallback={<HomeAccountFallback />}>
                <HomeAccountControl />
              </Suspense>
            </div>
          </div>
          <div className="pointer-events-none fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
            <div className="pointer-events-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="min-h-dvh pt-16">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
