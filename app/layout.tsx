import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import Navbar from "@/components/navbar/navbar";
import { GlobalContextProvider } from "@/context/globalContext";
import ReactQueryProvider from "@/provider/reaxtQueryProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Cine-Sphere",
    template: "%s | Cine-Sphere",
  },
};
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
        className={`bg-backgroundM font-chillax font-normal text-textMain ${chillax.className} relative`}
      >
        {" "}
        <GlobalContextProvider>
          <ReactQueryProvider>
            <Navbar />
            {children}
            <Toaster />
          </ReactQueryProvider>
        </GlobalContextProvider>
      </body>
    </html>
  );
}
