import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import MarqueeFooter from "../components/MarqueeFooter";
import Preloader from "../components/Preloader";
import GridOverlay from "../components/GridOverlay";

const Index = () => {
  const [loading, setLoading] = useState(true);

  const handleComplete = useCallback(() => setLoading(false), []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {loading && <Preloader onComplete={handleComplete} />}
      <GridOverlay />
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Contact />
      <MarqueeFooter />
    </div>
  );
};

export default Index;
