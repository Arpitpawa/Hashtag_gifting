import "./globals.css";

import Navbar from "@/components/layout/MainNavbar";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}