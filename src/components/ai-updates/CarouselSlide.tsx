import { motion } from "framer-motion";
import type { AiPostSlide } from "@/hooks/useAiPosts";

interface CarouselSlideProps {
  slide: AiPostSlide;
  index: number;
  total: number;
}

const CarouselSlide = ({ slide, index, total }: CarouselSlideProps) => {
  const accent = slide.accent_color || "#6366f1";

  if (slide.type === "cover") {
    return (
      <div
        className="w-[340px] h-[340px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, #0a0a0a 50%, ${accent}11 100%)`,
          border: `1px solid ${accent}33`,
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl mb-4"
        >
          ⚡
        </motion.div>
        <h1 className="text-2xl font-bold text-center tracking-tight" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
          {slide.headline}
        </h1>
        {slide.subheadline && (
          <p className="text-sm mt-3 opacity-60 tracking-widest uppercase">{slide.subheadline}</p>
        )}
        <div className="absolute bottom-4 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i === index ? accent : "#ffffff33" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "cta") {
    return (
      <div
        className="w-[340px] h-[340px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, #0a0a0a 50%, ${accent}11 100%)`,
          border: `1px solid ${accent}33`,
        }}
      >
        <div
          className="w-16 h-16 rounded-full mb-6 flex items-center justify-center text-2xl"
          style={{ background: `${accent}22`, border: `2px solid ${accent}55` }}
        >
          🔔
        </div>
        <h2 className="text-xl font-bold text-center">{slide.headline}</h2>
        {slide.subheadline && (
          <p className="text-sm mt-3 opacity-50 text-center">{slide.subheadline}</p>
        )}
        <div className="absolute bottom-4 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i === index ? accent : "#ffffff33" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // News slide
  return (
    <div
      className="w-[340px] h-[340px] rounded-2xl relative overflow-hidden flex flex-col p-6 text-white"
      style={{
        background: `linear-gradient(160deg, ${accent}15 0%, #0a0a0a 40%, #0a0a0a 100%)`,
        border: `1px solid ${accent}22`,
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">
          {slide.source || `Slide ${index + 1}`}
        </span>
      </div>
      <h3 className="text-lg font-bold leading-snug mb-4">{slide.headline}</h3>
      {slide.bullets && (
        <ul className="space-y-2 flex-1">
          {slide.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed opacity-80">
              <span style={{ color: accent }} className="mt-0.5">›</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between mt-auto pt-3">
        <span className="text-[10px] opacity-30">@ai_updates</span>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i === index ? accent : "#ffffff33" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselSlide;
