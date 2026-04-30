import LandingPageClient from "@/components/landing/landingPageClient";
import Navbar from "@/components/navbar/navbar";
import LandingBackdropCarousel from "@/components/landing/landingBackdropCarousel";

export default function LandingPage() {
  return (
    <div className="relative h-dvh overflow-hidden bg-backgroundM">
      <Navbar type="transparent" />
      <div className="relative h-dvh overflow-hidden pt-16 md:pt-14">
        <div className="absolute inset-0">
          <LandingBackdropCarousel />
        </div>
        <div className="relative z-20">
          <LandingPageClient />
        </div>
      </div>
    </div>
  );
}
