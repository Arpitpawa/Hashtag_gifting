import type { Metadata } from "next";
import { Caveat, Great_Vibes } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Hashtag Gifting",
  description: "Gifts that speak love",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${caveat.variable} ${greatVibes.variable}`}>
      <body>
        <AnnouncementBar />
        <Navbar />
        {children}
      </body>
    </html>
  );
}