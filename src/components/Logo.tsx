'use client'

/** IronFreight: minimalist sharp vector — shield containing "I" */
export function Logo({ className = '', variant = 'full', accent = 'lime' }: { className?: string; variant?: 'full' | 'icon'; accent?: 'orange' | 'lime' }) {
  const accentColor = accent === 'lime' ? '#C1FF00' : '#F97316'
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Sharp shield */}
      <path
        d="M16 2L4 6v10c0 7 5 11 12 14 7-3 12-7 12-14V6L16 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
        className="text-white"
      />
      {/* I */}
      <path
        d="M16 8v16M12 9h8M12 23h8"
        stroke={accentColor}
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {icon}
      <span className="font-semibold text-lg tracking-tight text-white">IRONFREIGHT</span>
    </span>
  )
}
