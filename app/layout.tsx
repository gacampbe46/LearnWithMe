import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://learnwithme.fyi"),
  title: "learnwithme",
  description:
    "Teach or learn skills in fitness, sewing, 3D printing, and more — step-by-step videos and courses from creators that resonate with you.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`} suppressHydrationWarning>
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
