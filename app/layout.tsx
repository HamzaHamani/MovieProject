import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { GlobalContextProvider } from "@/context/globalContext";
import ReactQueryProvider from "@/provider/reaxtQueryProvider";
import { Toaster } from "sonner";
import NextAuthProvider from "@/provider/nextAuthProvider";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  title: {
    default: "Cine-Sphere",
    template: "%s | Cine-Sphere",
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
      <body
        className={`font-geist- relative bg-backgroundM font-normal text-textMain ${chillax.className} relative`}
      >
        {" "}
        <GlobalContextProvider>
          <NextAuthProvider>
            <ReactQueryProvider>
              <>{children}</>
              <Toaster richColors position="bottom-center" />
            </ReactQueryProvider>
          </NextAuthProvider>
        </GlobalContextProvider>
      </body>
    </html>
  );
}
