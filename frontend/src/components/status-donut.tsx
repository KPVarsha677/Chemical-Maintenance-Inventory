export function StatusDonut({
  segments,
  size = 168,
  strokeWidth = 18,
  centerValue,
  centerLabel,
}: {
  segments: { value: number; colorClass: string }[];
  size?: number;
  strokeWidth?: number;
  centerValue: string | number;
  centerLabel: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null;
          const fraction = seg.value / total;
          const dash = fraction * circumference;
          const offset = -(cumulative / total) * circumference;
          cumulative += seg.value;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              className={seg.colorClass}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{centerValue}</span>
        <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">{centerLabel}</span>
      </div>
    </div>
  );
}
