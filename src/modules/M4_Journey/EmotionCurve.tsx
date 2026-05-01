import { STAGES } from '@/lib/types'
import { EMOTION_PEAK_STAGES } from '@/lib/constants'

const W = 720
const H = 220
const PAD_X = 60
const PAD_Y = 40

const yForLevel = (level: number) => {
  const minLevel = -1
  const maxLevel = 2
  const t = (level - minLevel) / (maxLevel - minLevel)
  return H - PAD_Y - t * (H - PAD_Y * 2)
}

const xForStageIndex = (idx: number) => {
  const cellWidth = (W - PAD_X * 2) / (STAGES.length - 1)
  return PAD_X + idx * cellWidth
}

const POINTS: Array<{ stage: number; level: number; peakKey?: 'p1' | 'p2' | 'p3' }> = [
  { stage: 0, level: 0 },
  { stage: 1, level: 1.5, peakKey: 'p1' },
  { stage: 2, level: 0.4 },
  { stage: 3, level: 1.8, peakKey: 'p2' },
  { stage: 4, level: 0.2 },
  { stage: 5, level: 1.6, peakKey: 'p3' },
]

const buildPath = () => {
  const coords = POINTS.map((p) => ({ x: xForStageIndex(p.stage), y: yForLevel(p.level) }))
  let d = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1]
    const curr = coords[i]
    const cx = (prev.x + curr.x) / 2
    d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return d
}

export function EmotionCurve() {
  const path = buildPath()
  const baselineY = yForLevel(0)

  return (
    <div className="rounded-lg border border-line-light bg-paper-card p-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-4xl mx-auto"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="客戶旅程情緒曲線,3 個高峰點分別在拜訪、提案、成交階段"
      >
        {/* baseline */}
        <line
          x1={PAD_X}
          y1={baselineY}
          x2={W - PAD_X}
          y2={baselineY}
          stroke="#D0D0D0"
          strokeDasharray="4 4"
        />

        {/* stage gridlines */}
        {STAGES.map((s, i) => (
          <line
            key={s.id}
            x1={xForStageIndex(i)}
            y1={PAD_Y}
            x2={xForStageIndex(i)}
            y2={H - PAD_Y}
            stroke="#E8E8E8"
          />
        ))}

        {/* curve */}
        <path d={path} stroke="#21362C" strokeWidth={2.5} fill="none" strokeLinecap="round" />

        {/* points */}
        {POINTS.map((p, i) => {
          const x = xForStageIndex(p.stage)
          const y = yForLevel(p.level)
          const isPeak = !!p.peakKey
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={isPeak ? 7 : 4}
                fill={isPeak ? '#A8842C' : '#21362C'}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              {isPeak && p.peakKey && (
                <text
                  x={x}
                  y={y - 14}
                  textAnchor="middle"
                  className="fill-accent-gold"
                  fontSize="11"
                  fontWeight="600"
                >
                  ⭐ {EMOTION_PEAK_STAGES[p.peakKey].sublabel}
                </text>
              )}
            </g>
          )
        })}

        {/* x-axis labels */}
        {STAGES.map((s, i) => (
          <text
            key={s.id}
            x={xForStageIndex(i)}
            y={H - PAD_Y + 22}
            textAnchor="middle"
            fontSize="11"
            fill="#4A4A4A"
            fontFamily="JetBrains Mono, monospace"
          >
            {s.id}
          </text>
        ))}

        {/* y-axis hint */}
        <text x={PAD_X - 12} y={yForLevel(2) + 4} textAnchor="end" fontSize="10" fill="#8B8B8B">
          高
        </text>
        <text x={PAD_X - 12} y={baselineY + 4} textAnchor="end" fontSize="10" fill="#8B8B8B">
          中
        </text>
        <text x={PAD_X - 12} y={yForLevel(-0.8) + 4} textAnchor="end" fontSize="10" fill="#8B8B8B">
          低
        </text>
      </svg>

      <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
        {(['p1', 'p2', 'p3'] as const).map((k) => (
          <div key={k} className="rounded border border-line-light p-2 bg-paper">
            <div className="font-mono text-accent-gold mb-0.5">⭐ {EMOTION_PEAK_STAGES[k].label}</div>
            <div className="text-ink-muted">於 {EMOTION_PEAK_STAGES[k].stage} 階段</div>
          </div>
        ))}
      </div>
    </div>
  )
}
