// Miracle X 品牌 sigil — 沙漏 / Σ / 金字塔合一
// Brand book: PANTONE 5605C · #21362C · 概念為燈塔/迷宮/SIGMA

interface SigilProps {
  className?: string
  title?: string
}

export function MxSigil({ className, title = 'Miracle X' }: SigilProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      role="img"
      aria-label={title}
    >
      {/* outer hourglass / sigma */}
      <path d="M 8 6 L 92 6 L 50 60 L 92 114 L 8 114 L 50 60 Z" />
      {/* inner V (top, pointing up) */}
      <path d="M 26 18 L 50 50 L 74 18" strokeWidth={2.5} />
      {/* inner V (bottom, pointing down) */}
      <path d="M 26 102 L 50 70 L 74 102" strokeWidth={2.5} />
      {/* center anchor dot */}
      <circle cx="50" cy="60" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

interface WordmarkProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact'
}

const SIZE = {
  sm: { sigil: 'h-4', word: 'text-sm tracking-[0.18em]' },
  md: { sigil: 'h-5', word: 'text-base tracking-[0.18em]' },
  lg: { sigil: 'h-7', word: 'text-xl tracking-[0.16em]' },
}

export function MxLockup({ className, size = 'md', variant = 'default' }: WordmarkProps) {
  const s = SIZE[size]
  if (variant === 'compact') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-brand ${className ?? ''}`}>
        <MxSigil className={`${s.sigil} aspect-[5/6]`} />
        <span className={`font-serif font-bold ${s.word}`}>MIRACLE&nbsp;X</span>
      </span>
    )
  }
  // default: wordmark with sigil sitting in the middle (replaces the X letter visually)
  return (
    <span className={`inline-flex items-baseline gap-[0.28em] text-brand ${className ?? ''}`}>
      <span className={`font-serif font-bold ${s.word}`}>MIRACLE</span>
      <MxSigil className={`${s.sigil} self-center aspect-[5/6] -mb-[0.05em]`} />
      <span className={`font-serif font-bold ${s.word}`}>X</span>
    </span>
  )
}
