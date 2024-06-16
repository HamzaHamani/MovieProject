import Navbar from "@/components/general/navbar";

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className={""}>
      <Navbar />
      {children}
    </section>
  );
}
