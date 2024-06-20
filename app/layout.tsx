import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import Navbar from "@/components/navbar/navbar";

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
        className={`bg-background text-textMain font-chillax font-normal   ${chillax.className}  `}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
