const Logo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 🔥 Fire Gradient */}
        <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2b0000" />
          <stop offset="25%" stopColor="#8b0000" />
          <stop offset="50%" stopColor="#ff2400" />
          <stop offset="75%" stopColor="#ff6a00" />
          <stop offset="100%" stopColor="#ffd000" />
        </linearGradient>

        {/* 🔥 Slow Heat Distortion */}
        <filter id="heatDistortion">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.03"
            numOctaves={3}
            seed={7}
            result="turbulence"
          >
            <animate
              attributeName="baseFrequency"
              from="0.02 0.03"
              to="0.06 0.07"
              dur="20s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" />
        </filter>

        {/* 🔥 Mask Ripple */}
        <filter id="maskFireWave">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="6"
            numOctaves={2}
            seed={9}
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              from="0.03"
              to="0.07"
              dur="18s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" />
        </filter>

        {/* 🌫 Subtle Smoke Filter */}
        <filter id="smokeFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="10"
            numOctaves={4}
            seed={15}
            result="smoke"
          >
            <animate
              attributeName="baseFrequency"
              from="0.01"
              to="0.02"
              dur="25s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feGaussianBlur stdDeviation="8" result="softSmoke" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.8
                    0 0 0 0 0.8
                    0 0 0 0 0.8
                    0 0 0 0.25 0"
          />
        </filter>

        {/* 🔥 Animated Mask */}
        <mask id="mask0">
          <rect width="512" height="512" fill="white" />
          <path
            fill="black"
            filter="url(#maskFireWave)"
            d="M240.737 194.502C246.535 189.386 255.382 189.94 260.498 195.737L313.671 256L260.498 316.263C255.382 322.06 246.535 322.614 240.737 317.498C234.94 312.382 234.386 303.535 239.502 297.737L276.328 256L239.502 214.263C234.386 208.465 234.94 199.618 240.737 194.502Z"
          />
        </mask>
      </defs>

      {/* 🔥 Main Fire Shape */}
      <g mask="url(#mask0)">
        <path
          fill="url(#fireGradient)"
          filter="url(#heatDistortion)"
          d="M181.59 183.355C180.41 182.073 181.319 180 183.061 180H273.85C296.295 180 318.088 187.551 335.722 201.439L403.005 254.429C404.022 255.23 404.022 256.77 403.005 257.571L335.722 310.561C318.088 324.449 296.295 332 273.85 332H183.061C181.319 332 180.41 329.927 181.59 328.645L247.252 257.355C247.957 256.589 247.957 255.411 247.252 254.645L181.59 183.355Z"
        />

        {/* 🌫 Smoke Overlay */}
        <rect width="512" height="512" filter="url(#smokeFilter)" opacity="0.35">
          <animate attributeName="y" from="0" to="-40" dur="30s" repeatCount="indefinite" />
        </rect>
      </g>

      {/* 🔥 Left Arrow */}
      <path
        fill="url(#fireGradient)"
        filter="url(#heatDistortion)"
        d="M155.922 205.695C161.061 200.682 169.291 200.783 174.305 205.922L223.162 256L174.305 306.078C169.291 311.217 161.061 311.318 155.922 306.305C150.783 301.291 150.682 293.061 155.695 287.922L186.838 256L155.695 224.078C150.682 218.939 150.783 210.709 155.922 205.695Z"
      />
    </svg>
  );
};

export default Logo;
