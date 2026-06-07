import { formatPercent } from "@/lib/locale";

interface UsageWheelProps {
  percent: number;
  size?: number;
}

/** Circular monthly-usage indicator (the 25% wheel in the sidebar header). */
export function UsageWheel({ percent, size = 40 }: UsageWheelProps) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-ink-strong">
        {formatPercent(percent)}
      </span>
    </div>
  );
}
