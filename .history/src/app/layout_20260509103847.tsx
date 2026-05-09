import type { Metadata } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
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
    <html lang="en" className={caveat.variable}>
      <body>
        <AnnouncementBar />
        <Navbar />
        {children}
      </body>
    </html>
  );
}