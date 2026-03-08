import type { AiPostSlide } from "@/hooks/useAiPosts";

interface CarouselSlideProps {
  slide: AiPostSlide;
  index: number;
  total: number;
}

const CarouselSlide = ({ slide, index, total }: CarouselSlideProps) => {
  const accent = slide.accent_color || "#6366f1";

  const dots = (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i === index ? accent : "#ffffff55" }}
        />
      ))}
    </div>
  );

  if (slide.type === "cover") {
    return (
      <div
        className="w-[340px] h-[340px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-end p-8 pb-10 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent}33 0%, #0a0a0a 60%, ${accent}15 100%)`,
          border: `1px solid ${accent}44`,
        }}
      >
        {/* Background image with heavy overlay for drama */}
        {slide.image_url && (
          <div className="absolute inset-0 z-0">
            <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: `linear-gradient(180deg, ${accent}33 0%, #0a0a0aee 55%, #0a0a0a 100%)`,
            }} />
          </div>
        )}
        {!slide.image_url && (
          <div className="absolute inset-0 z-0" style={{
            background: `radial-gradient(ellipse at 30% 20%, ${accent}22 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${accent}15 0%, transparent 50%)`,
          }} />
        )}

        {/* Accent top bar */}
        <div
          className="absolute top-0 left-0 w-full h-1 z-10"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />

        {/* Glowing orb decoration */}
        <div className="absolute top-6 right-6 z-10">
          <div className="w-8 h-8 rounded-full" style={{
            background: `radial-gradient(circle, ${accent}88, ${accent}22, transparent)`,
            boxShadow: `0 0 30px ${accent}44`,
          }} />
        </div>

        {/* Content at bottom */}
        <div className="relative z-10 flex flex-col items-start w-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
            <span className="text-[10px] uppercase tracking-[0.25em] opacity-70 font-medium">justoutput</span>
          </div>
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-left" style={{ fontFamily: "'Montserrat Alternates', sans-serif" }}>
            {slide.headline}
          </h1>
          {slide.subheadline && (
            <p className="text-xs mt-2 opacity-50 tracking-wider uppercase font-medium">{slide.subheadline}</p>
          )}
        </div>
        {dots}
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
        {/* Background image with heavy overlay */}
        {slide.image_url && (
          <div className="absolute inset-0 z-0">
            <img src={slide.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at center, #0a0a0acc 0%, #0a0a0aee 60%, #0a0a0a 100%)`,
            }} />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center">
          <div
            className="w-14 h-14 rounded-full mb-5 flex items-center justify-center"
            style={{ background: `${accent}22`, border: `2px solid ${accent}55`, boxShadow: `0 0 40px ${accent}22` }}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }} />
          </div>
          <h2 className="text-xl font-bold text-center">{slide.headline}</h2>
          {slide.subheadline && (
            <p className="text-sm mt-3 opacity-50 text-center">{slide.subheadline}</p>
          )}
          <div className="mt-5 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase" style={{
            background: `${accent}22`,
            border: `1px solid ${accent}44`,
            color: accent,
          }}>
            @justoutput
          </div>
        </div>
        {dots}
      </div>
    );
  }

  // News slide
  const maxBullets = slide.bullets ? Math.min(slide.bullets.length, 4) : 0;
  const displayBullets = slide.bullets?.slice(0, maxBullets) || [];

  return (
    <div
      className="w-[340px] h-[340px] rounded-2xl relative overflow-hidden flex flex-col text-white"
      style={{
        background: `linear-gradient(160deg, ${accent}15 0%, #0a0a0a 40%, #0a0a0a 100%)`,
        border: `1px solid ${accent}22`,
      }}
    >
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />

      {slide.image_url && (
        <div className="h-[80px] w-full overflow-hidden shrink-0 relative">
          <img src={slide.image_url} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent, #0a0a0a)` }} />
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 min-h-0">
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">
            {slide.source || `Slide ${index + 1}`}
          </span>
        </div>

        <h3 className="text-base font-bold leading-snug mb-3 shrink-0 line-clamp-2">{slide.headline}</h3>

        {displayBullets.length > 0 && (
          <ul className="space-y-1.5 flex-1 min-h-0 overflow-hidden">
            {displayBullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-[11px] leading-relaxed opacity-80">
                <span style={{ color: accent }} className="mt-0.5 shrink-0">--</span>
                <span className="line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 shrink-0">
          <span className="text-[10px] opacity-30">@justoutput</span>
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
    </div>
  );
};

export default CarouselSlide;
