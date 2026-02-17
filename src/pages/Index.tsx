import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import About from "../components/About";
import Experience from "../components/Experience";
import PhotoGallery from "../components/PhotoGallery";
import Contact from "../components/Contact";

const Index = () => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Experience />
      <PhotoGallery />
      <Contact />
    </div>
  );
};

export default Index;
