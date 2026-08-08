import type { Metadata, Viewport } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Script from "next/script";
import { GlobalContextProvider } from "@/context/globalContext";
import ReactQueryProvider from "@/provider/reaxtQueryProvider";
import { Toaster } from "sonner";
import NextAuthProvider from "@/provider/nextAuthProvider";
import { GeistMono } from "geist/font/mono";
import TopLoaderClient from "@/components/ui/TopLoaderClient";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import InternalTopProgress from "@/components/ui/InternalTopProgress";
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SEO_KEYWORDS,
} from "@/config/site";
import ClarityInit from "@/components/ClarityInit";

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Watch Movies & TV Shows First`,
    template: "%s | " + SITE_NAME,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: `${SITE_NAME} | Watch Movies & TV Shows`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Watch movies and TV shows on Cinesphere`,
      },
    ],
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Watch Movies & TV Shows`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};
// GeistMono is already imported and can be used directly in your className or font configuration.

const chillax = localFont({
  src: [
    {
      path: "../public/fonts/Chillax-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Chillax-Extralight.otf",
      weight: "200",
    },
    {
      path: "../public/fonts/Chillax-Light.otf",
      weight: "300",
    },
    {
      path: "../public/fonts/Chillax-Medium.otf",
      weight: "500",
    },
    {
      path: "../public/fonts/Chillax-Semibold.otf",
      weight: "600",
    },
    {
      path: "../public/fonts/Chillax-Bold.otf",
      weight: "700",
    },
  ],
  variable: "--font-chillax",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="clarity-script"
          strategy="afterInteractive" // Matches the async behavior of the original script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "xz7uea5o10");
            `,
          }}
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-7472549542421138"
        ></meta>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo.png`,
                width: 250,
                height: 250,
              },
              description: SITE_DESCRIPTION,
              sameAs: [
                "https://twitter.com/cinesphere",
                "https://instagram.com/cinesphere",
              ],
            }),
          }}
        />

        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              keywords: SEO_KEYWORDS,
              publisher: {
                "@id": `${SITE_URL}/#organization`,
              },
              inLanguage: "en-US",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Google AdSense */}
      </head>
      <body
        className={`font-geist- relative bg-backgroundM font-normal text-textMain ${chillax.className} relative`}
      >
        {" "}
        <GlobalContextProvider>
          <NextAuthProvider>
            <ReactQueryProvider>
              <TopLoaderClient />
              <InternalTopProgress />
              <>{children}</>
              <Toaster richColors position="bottom-center" />
            </ReactQueryProvider>
          </NextAuthProvider>
        </GlobalContextProvider>
        <Analytics />
        <SpeedInsights />
        <ClarityInit />
      </body>
    </html>
  );
}
