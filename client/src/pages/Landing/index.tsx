import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { Footer } from "@/components/layout/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}