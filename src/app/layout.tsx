import type { Metadata } from "next";
import { Caveat, Great_Vibes, Prompt } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-prompt",
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
    <html lang="en" className={`${caveat.variable} ${greatVibes.variable} ${prompt.variable}`}>
      <body>
        <AnnouncementBar />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}