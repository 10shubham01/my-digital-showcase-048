import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
      >
        <div className="pointer-events-auto flex flex-col items-center gap-6 max-w-lg">
          {/* Close */}
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {slides[currentSlide] && (
                <CarouselSlide slide={slides[currentSlide]} index={currentSlide} total={slides.length} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
              disabled={currentSlide === 0}
              className="p-2.5 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentSlide ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((p) => Math.min(slides.length - 1, p + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2.5 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Post info & Edit button */}
          <div className="text-center space-y-2">
            <h3 className="text-white font-semibold text-sm">{post.title}</h3>
            {post.summary && <p className="text-white/50 text-xs max-w-sm">{post.summary}</p>}
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
