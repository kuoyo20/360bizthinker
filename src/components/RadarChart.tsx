interface RadarDataPoint {
  label: string;
  value: number; // 1-5
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  max?: number;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export default function RadarChart({
  data,
  size = 360,
  max = 5,
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const n = data.length;
  const step = 360 / n;
  const gridLevels = Array.from({ length: max }, (_, i) => i + 1);

  const dataPoints = data.map((d, i) =>
    polar(cx, cy, r * (Math.max(0, Math.min(d.value, max)) / max), i * step),
  );
  const dataPath =
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + " Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="text-foreground"
    >
      {/* concentric pentagons (grid) */}
      {gridLevels.map((level) => {
        const points = data
          .map((_, i) => {
            const p = polar(cx, cy, r * (level / max), i * step);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          })
          .join(" ");
        return (
          <polygon
            key={level}
            points={points}
            fill={level === max ? "hsl(var(--muted) / 0.2)" : "none"}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={0.6}
          />
        );
      })}

      {/* axes */}
      {data.map((_, i) => {
        const end = polar(cx, cy, r, i * step);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={end.x}
            y2={end.y}
            stroke="currentColor"
            strokeOpacity={0.15}
            strokeWidth={0.6}
          />
        );
      })}

      {/* data polygon */}
      <path
        d={dataPath}
        fill="hsl(var(--primary) / 0.18)"
        stroke="hsl(var(--primary))"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="hsl(var(--primary))"
        />
      ))}

      {/* labels */}
      {data.map((d, i) => {
        const labelPos = polar(cx, cy, r * 1.18, i * step);
        return (
          <g key={i}>
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={13}
              fill="currentColor"
              className="font-serif"
            >
              {d.label}
            </text>
            <text
              x={labelPos.x}
              y={labelPos.y + 16}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={12}
              fill="hsl(var(--primary))"
              fontWeight={600}
            >
              {d.value.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
