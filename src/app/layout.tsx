import type { Metadata } from "next";
import { Caveat, Great_Vibes, Poppins, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar         from "@/components/layout/Navbar";
import Footer         from "@/components/layout/Footer";
import Providers      from "@/components/layout/Providers";
import { getNavCategories } from "@/lib/getNavCategories";
import { getActiveProductCount, roundDownForMarketing } from "@/lib/productCount";

const caveat = Caveat({
  subsets:  ["latin"],
  variable: "--font-caveat",
});
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight:  "400",
  variable: "--font-logo",
});
const dmSerif = DM_Serif_Display({
  subsets:  ["latin"],
  weight:   "400",
  style:    ["normal", "italic"],
  variable: "--font-dm-serif",
});
const poppins = Poppins({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
  variable: "--font-heading", // Playfair is now the primary heading font
});

const BASE_URL = "https://www.hashtaggifting.com";

export async function generateMetadata(): Promise<Metadata> {
  const productCount = roundDownForMarketing(await getActiveProductCount());

  return {
  metadataBase: new URL(BASE_URL),

  title: {
    default:  "Hashtag Gifting — Personalised Gifts Delivered Across India",
    template: "%s — Hashtag Gifting",
  },
  description:
    `Shop ${productCount}+ handcrafted personalised gifts — wallets, passport covers, diaries, pens, gift combos & more. Same-day dispatch in Jaipur. Free delivery above Rs. 999.`,

  keywords: [
    "personalised gifts india", "custom gifts jaipur", "personalised wallet", "passport cover",
    "explosion box", "birthday gifts", "anniversary gifts", "customized gifts online",
    "personalised gifts for him", "personalised gifts for her", "hashtag gifting",
  ],

  authors: [{ name: "Hashtag Gifting", url: BASE_URL }],
  creator: "Hashtag Gifting",
  publisher: "Hashtag Gifting",

  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         BASE_URL,
    siteName:    "Hashtag Gifting",
    title:       "Hashtag Gifting — Personalised Gifts Delivered Across India",
    description: `Shop ${productCount}+ handcrafted personalised gifts. Same-day dispatch in Jaipur. Free delivery above Rs. 999.`,
    images: [
      {
        url:    "/og-image.jpg",
        width:  1200,
        height: 630,
        alt:    "Hashtag Gifting — Personalised Gifts",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "Hashtag Gifting — Personalised Gifts Delivered Across India",
    description: `Shop ${productCount}+ handcrafted personalised gifts. Same-day dispatch in Jaipur.`,
    images:      ["/og-image.jpg"],
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  icons: {
    icon:    "/favicon.ico",
    apple:   "/apple-touch-icon.png",
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetched here (server-side, on every request) and handed to Navbar as
  // initial data — previously Navbar only loaded categories via its own
  // client-side useEffect, so the category row rendered empty for a beat on
  // first paint until that fetch resolved. Root layout doesn't remount on
  // client-side navigation between pages, so this only runs once per real
  // page load/refresh, not on every link click.
  let initialCategories: any[] = [];
  try {
    initialCategories = await getNavCategories();
  } catch (err) {
    console.error("ROOT LAYOUT: failed to load nav categories:", err);
  }

  let announcementProductCount: number | undefined;
  try {
    announcementProductCount = roundDownForMarketing(await getActiveProductCount());
  } catch (err) {
    console.error("ROOT LAYOUT: failed to load product count:", err);
  }

  return (
    <html
      lang="en"
      className={`${caveat.variable} ${greatVibes.variable} ${dmSerif.variable} ${poppins.variable} ${playfair.variable}`}
    >
      <body>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Providers>
          <AnnouncementBar productCount={announcementProductCount} />
          <Navbar initialCategories={initialCategories} />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}