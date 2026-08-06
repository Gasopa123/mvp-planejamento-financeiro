"use client";

import { useEffect, useId, useState } from "react";

type GaugeChartProps = {
  /** 0 a 100. */
  percent: number;
  size?: number;
};

// Gauge circular em SVG puro (reference .gauge-svg/.gauge-arc): arco que
// "enche" do zero até o percentual, com gradiente azul→verde e o valor
// escrito no centro na tipografia display.
export function GaugeChart({ percent, size = 120 }: GaugeChartProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const clamped = Math.min(100, Math.max(0, percent));
  const r = size * 0.4167; // mesma proporção do gauge de referência (50/120)
  const strokeWidth = size * 0.1;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = mounted ? circumference * (1 - clamped / 100) : circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(clamped)}%`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDF1F7" strokeWidth={strokeWidth} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)" }}
      />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0057FF" />
          <stop offset="100%" stopColor="#2ECC71" />
        </linearGradient>
      </defs>
      <text
        x={cx}
        y={cy + size * 0.055}
        textAnchor="middle"
        className="font-display"
        fontSize={size * 0.183}
        fontWeight={600}
        fill="#0B1F3A"
      >
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}
