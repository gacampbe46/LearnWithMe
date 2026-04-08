import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://learnwithme.fyi"),
  title: "learnwithme",
  description:
    "Structured programs at your own pace — teach or learn skills without living in a feed. Calm UX focused on finishing courses; sample members and programs inside.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
