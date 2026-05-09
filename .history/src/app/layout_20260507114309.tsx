import "./globals.css";

import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Hashtag Gifting",
  description: "Premium Personalized Gifting Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>

        <AnnouncementBar />

        <Navbar />

        {children}

      </body>
    </html>
  );
}