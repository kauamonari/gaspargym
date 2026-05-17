interface Props {
  value: number;
  goal: number;
  size?: number;
  stroke?: number;
  label?: string;
  unit?: string;
}

export function MacroRing({ value, goal, size = 200, stroke = 14, label = "kcal", unit = "" }: Props) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / Math.max(goal, 1), 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.19 142)" />
            <stop offset="100%" stopColor="oklch(0.62 0.22 155)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.2,.7,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold tabular-nums text-foreground">
          {Math.round(value)}{unit}
        </span>
        <span className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          de {Math.round(goal)} {label}
        </span>
      </div>
    </div>
  );
}
