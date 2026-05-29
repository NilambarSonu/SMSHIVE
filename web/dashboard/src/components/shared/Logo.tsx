// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — SVG Logo Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function SmshiveLogo({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Hexagon shape */}
      <path
        d="M32 4L56 18V46L32 60L8 46V18L32 4Z"
        fill="url(#logo-gradient)"
        stroke="url(#logo-stroke)"
        strokeWidth="2"
      />
      {/* Signal waves */}
      <path
        d="M24 36C24 36 28 28 32 28C36 28 40 36 40 36"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M20 40C20 40 26 24 32 24C38 24 44 40 44 40"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M16 44C16 44 24 20 32 20C40 20 48 44 48 44"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.3"
      />
      {/* Center dot */}
      <circle cx="32" cy="38" r="3" fill="white" />
      <defs>
        <linearGradient id="logo-gradient" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C63FF" />
          <stop offset="1" stopColor="#00D4AA" />
        </linearGradient>
        <linearGradient id="logo-stroke" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B83FF" />
          <stop offset="1" stopColor="#33DFBB" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SmshiveLogoFull({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SmshiveLogo size={36} />
      <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] bg-clip-text text-transparent">
        SMSHIVE
      </span>
    </div>
  );
}
