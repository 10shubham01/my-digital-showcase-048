import { motion } from "framer-motion";

const GridOverlay = () => {
  const verticalTicks = Array.from({ length: 40 }, (_, i) => i * 100);
  const horizontalTicks = Array.from({ length: 20 }, (_, i) => i * 100);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none select-none">
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />
      {/* Subtle sub-grid - hidden on mobile */}
      <div
        className="absolute inset-0 opacity-[0.012] hidden md:block"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px), linear-gradient(90deg, hsl(var(--foreground)) 0.5px, transparent 0.5px)",
          backgroundSize: "25px 25px",
        }}
      />

      {/* Top ruler - hidden on mobile */}
      <div className="absolute top-0 left-0 right-0 h-5 bg-background/80 backdrop-blur-sm border-b border-foreground/5  flex items-end overflow-hidden">
        {horizontalTicks.map((px) => (
          <div
            key={`h-${px}`}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${px + 32}px` }}
          >
            <span className="text-[7px] font-mono text-muted-foreground/40 mb-px leading-none">{px}</span>
            <div className="w-px h-1.5 bg-muted-foreground/20" />
          </div>
        ))}
        {Array.from({ length: 80 }, (_, i) => i * 25).map((px) =>
          px % 100 !== 0 ? (
            <div
              key={`hm-${px}`}
              className="absolute bottom-0 w-px h-1 bg-muted-foreground/10"
              style={{ left: `${px + 32}px` }}
            />
          ) : null,
        )}
      </div>

      {/* Left ruler - narrower on mobile, full on desktop */}
      <div className="absolute top-0 md:top-5 left-0 w-5 md:w-8 bottom-0 bg-background/80 backdrop-blur-sm border-r border-foreground/5 overflow-hidden z-50">
        {verticalTicks.map((px) => (
          <div key={`v-${px}`} className="absolute right-0 flex items-center" style={{ top: `${px}px` }}>
            <span className="text-[6px] md:text-[7px] font-mono text-muted-foreground/40 mr-0.5 md:mr-1 leading-none hidden md:inline">
              {px}
            </span>
            <div className="h-px w-1 md:w-1.5 bg-muted-foreground/20" />
          </div>
        ))}
        {Array.from({ length: 160 }, (_, i) => i * 25).map((px) =>
          px % 100 !== 0 ? (
            <div
              key={`vm-${px}`}
              className="absolute right-0 h-px w-0.5 md:w-1 bg-muted-foreground/10"
              style={{ top: `${px}px` }}
            />
          ) : null,
        )}
      </div>

      {/* Corner square - hidden on mobile */}
      <div className="absolute top-0 left-0 w-5 md:w-8 h-3 md:h-5 bg-background/90 border-b border-r border-foreground/5 hidden md:flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-accent-pop/40 rounded-full" />
      </div>
    </div>
  );
};

export default GridOverlay;
