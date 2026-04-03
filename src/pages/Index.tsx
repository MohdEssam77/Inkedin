import { useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PostGenerator from "@/components/PostGenerator";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onGetStarted={scrollToGenerator} />
      <PostGenerator ref={generatorRef} />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
