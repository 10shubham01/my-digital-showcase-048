import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const images = [
{ src: "/images/one.jpeg", alt: "Adventure photo 1" },
{ src: "/images/three.jpg", alt: "Adventure photo 2" },
{ src: "/images/four.jpg", alt: "Adventure photo 3" },
{ src: "/images/five.jpeg", alt: "Adventure photo 4" },
{ src: "/images/six.webp", alt: "Adventure photo 5" },
{ src: "/images/seven.webp", alt: "Adventure photo 6" }];


const PhotoGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return;





















































};

export default PhotoGallery;