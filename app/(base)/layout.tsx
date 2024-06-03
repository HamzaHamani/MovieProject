import Navbar from "@/components/general/navbar";

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={""}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
