import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SectionHeading from "./SectionHeading";

const images = [
  { src: "/images/one.jpeg", alt: "Adventure photo 1" },
  { src: "/images/three.jpg", alt: "Adventure photo 2" },
  { src: "/images/four.jpg", alt: "Adventure photo 3" },
  { src: "/images/five.jpeg", alt: "Adventure photo 4" },
  { src: "/images/six.webp", alt: "Adventure photo 5" },
  { src: "/images/seven.webp", alt: "Adventure photo 6" },
];

const PhotoGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const row1 = [...images, ...images];
  const row2 = [...images.slice().reverse(), ...images.slice().reverse()];

  return (
    <section id="gallery" className="py-24 md:py-32 overflow-hidden relative" ref={ref}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="px-6 md:px-12 lg:px-24 mb-12">
        <SectionHeading title="Moments" number="—" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
        className="space-y-4"
      >
        {/* Row 1 - left to right */}
        <div className="flex animate-marquee">
          {row1.map((img, i) => (
            <div key={`r1-${i}`} className="flex-shrink-0 w-64 h-40 md:w-80 md:h-48 mx-2 overflow-hidden group">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 border border-border"
              />
            </div>
          ))}
        </div>

        {/* Row 2 - right to left */}
        <div className="flex animate-marquee-reverse">
          {row2.map((img, i) => (
            <div key={`r2-${i}`} className="flex-shrink-0 w-64 h-40 md:w-80 md:h-48 mx-2 overflow-hidden group">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 border border-border"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default PhotoGallery;
