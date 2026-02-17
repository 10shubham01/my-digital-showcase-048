import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import MarqueeFooter from "../components/MarqueeFooter";

const Index = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
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
