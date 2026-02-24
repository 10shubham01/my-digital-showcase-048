const TechIcons: Record<string, () => JSX.Element> = {
  TypeScript: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="2" className="stroke-[hsl(var(--accent-blue))]" />
      <path d="M13.5 12h-3v8M10.5 12h5" className="stroke-[hsl(var(--accent-blue))]" />
      <path d="M17.5 12.5c0-.5-.5-1-1.5-1s-1.5.5-1.5 1 .5 1 1.5 1.2 1.5.7 1.5 1.3-.5 1-1.5 1-1.5-.5-1.5-1" className="stroke-[hsl(var(--accent-blue))]" />
    </svg>
  ),
  React: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.2">
      <ellipse cx="12" cy="12" rx="10" ry="4" className="stroke-[hsl(var(--accent-cyan))]" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" className="stroke-[hsl(var(--accent-cyan))]" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" className="stroke-[hsl(var(--accent-cyan))]" />
      <circle cx="12" cy="12" r="1.5" className="fill-[hsl(var(--accent-cyan))]" />
    </svg>
  ),
  "Next.js": () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" className="stroke-foreground" />
      <path d="M8 8v8M8 8l9 12" className="stroke-foreground" />
      <path d="M16 8v5" className="stroke-foreground" />
    </svg>
  ),
  "Vue.js": () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 3h4l6 10.5L18 3h4L12 21z" className="stroke-[hsl(var(--accent-green))]" />
      <path d="M6.5 3L12 12.5 17.5 3" className="stroke-[hsl(var(--accent-green))]" strokeWidth="1.2" />
    </svg>
  ),
  "Nuxt.js": () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 19h20L15 5l-4 7-4-4z" className="stroke-[hsl(var(--accent-green))]" />
    </svg>
  ),
  "Node.js": () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l9 5v10l-9 5-9-5V7z" className="stroke-[hsl(var(--accent-green))]" />
      <path d="M12 7v10" className="stroke-[hsl(var(--accent-green))]" strokeWidth="1.2" />
      <path d="M12 12l5-3M12 12l-5-3" className="stroke-[hsl(var(--accent-green))]" strokeWidth="1" />
    </svg>
  ),
  "Tailwind CSS": () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8c1-3 3-4 6-4 4.5 0 5 3 7.5 3.5 1.7.3 3-.5 4-2" className="stroke-[hsl(var(--accent-cyan))]" />
      <path d="M2.5 14.5c1-3 3-4 6-4 4.5 0 5 3 7.5 3.5 1.7.3 3-.5 4-2" className="stroke-[hsl(var(--accent-cyan))]" />
    </svg>
  ),
  PostgreSQL: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="7" rx="8" ry="3" className="stroke-[hsl(var(--accent-blue))]" />
      <path d="M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7" className="stroke-[hsl(var(--accent-blue))]" />
      <path d="M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5" className="stroke-[hsl(var(--accent-blue))]" />
    </svg>
  ),
  AWS: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 15l4-8 3 5 3-5 4 8" className="stroke-[hsl(var(--accent-orange))]" />
      <path d="M2 17c3 2 7 3 10 3s7-1 10-3" className="stroke-[hsl(var(--accent-orange))]" strokeWidth="1.2" />
    </svg>
  ),
  Git: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2v20M3 12h18" className="stroke-[hsl(var(--accent-orange))]" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" className="stroke-[hsl(var(--accent-orange))]" />
      <circle cx="12" cy="5" r="1.5" className="stroke-[hsl(var(--accent-orange))]" />
      <circle cx="18" cy="12" r="1.5" className="stroke-[hsl(var(--accent-orange))]" />
    </svg>
  ),
};

export default TechIcons;
