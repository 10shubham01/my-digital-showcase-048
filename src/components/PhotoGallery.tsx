import { motion, useInView } from "framer-motion";
import { useRef } from "react";

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

  return (
    <section ref={ref} className="py-16 md:py-24 overflow-hidden">
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center text-xs font-body text-muted-foreground tracking-[0.3em] uppercase mb-10"
      >
        Adventure is out there
      </motion.p>

      {/* Row 1 - scrolls left */}
      <div className="mb-4 overflow-hidden">
        <div className="animate-marquee flex w-max gap-4">
          {[...images, ...images].map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: -1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-56 h-72 md:w-72 md:h-80 flex-shrink-0 overflow-hidden rounded-sm"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Row 2 - scrolls right */}
      <div className="overflow-hidden">
        <div className="animate-marquee-reverse flex w-max gap-4">
          {[...images.slice().reverse(), ...images.slice().reverse()].map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-56 h-72 md:w-72 md:h-80 flex-shrink-0 overflow-hidden rounded-sm"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
