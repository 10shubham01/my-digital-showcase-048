import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import type { AiPost, AiPostSlide } from "@/hooks/useAiPosts";
import CarouselSlide from "./CarouselSlide";

interface CarouselPreviewModalProps {
  post: AiPost;
  onClose: () => void;
  onEdit: (post: AiPost) => void;
}

const CarouselPreviewModal = ({ post, onClose, onEdit }: CarouselPreviewModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = (post.slides || []) as AiPostSlide[];

  const goNext = () => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1));
  const goPrev = () => setCurrentSlide((p) => Math.max(0, p - 1));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-col items-center gap-6 max-w-lg relative">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Stacked slides */}
          <div
            className="relative w-[340px] h-[340px] cursor-pointer"
            onClick={goNext}
          >
            {slides.map((slide, i) => {
              const offset = i - currentSlide;
              // Show current + 2 behind
              if (offset < 0 || offset > 2) return null;

              return (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    scale: 1 - offset * 0.06,
                    y: offset * 18,
                    opacity: offset === 0 ? 1 : 0.6 - offset * 0.15,
                    rotateZ: offset * 1.5,
                    zIndex: slides.length - offset,
                  }}
                  exit={{
                    scale: 1.05,
                    y: -60,
                    opacity: 0,
                    rotateZ: -5,
                  }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 200,
                  }}
                  style={{ pointerEvents: offset === 0 ? "auto" : "none" }}
                >
                  <CarouselSlide slide={slide} index={i} total={slides.length} />
                </motion.div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              disabled={currentSlide === 0}
              className="p-2 rounded-full bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "bg-white scale-125 shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                      : i < currentSlide
                        ? "bg-white/50"
                        : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              disabled={currentSlide === slides.length - 1}
              className="p-2 rounded-full bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Post info */}
          <div className="text-center space-y-2">
            <h3 className="text-white font-semibold text-sm">{post.title}</h3>
            {post.summary && <p className="text-white/40 text-xs max-w-sm">{post.summary}</p>}
            <button
              onClick={() => { onClose(); onEdit(post); }}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Open Editor
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default CarouselPreviewModal;
