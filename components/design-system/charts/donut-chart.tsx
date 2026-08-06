"use client";

import { useEffect, useState } from "react";

export type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  size?: number;
  /** 0 = pizza cheia; >0 = rosca (donut) com esse raio de furo. */
  innerRadius?: number;
};

function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const [x1, y1] = polar(cx, cy, r, startAngle);
  const [x2, y2] = polar(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
}

// Gráfico de pizza/rosca em SVG puro (reference buildPie), com o mesmo efeito
// de entrada (fade + scale) por segmento, escalonado.
export function DonutChart({ segments, size = 240, innerRadius = 0 }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const total = segments.reduce((sum, seg) => sum + seg.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Ângulo acumulado de cada fatia, sem mutar uma variável externa ao map.
  const angulos = segments.reduce<{ inicio: number; fim: number }[]>((acc, seg) => {
    const inicio = acc.length > 0 ? acc[acc.length - 1].fim : 0;
    const sweep = (seg.value / total) * 360;
    return [...acc, { inicio, fim: inicio + sweep }];
  }, []);
  const arcs = segments.map((seg, index) => ({
    ...seg,
    d: arcPath(cx, cy, r, angulos[index].inicio, angulos[index].fim),
  }));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={segments.map((s) => `${s.label}: ${Math.round((s.value / total) * 100)}%`).join(", ")}
    >
      {arcs.map((arc, index) => (
        <path
          key={arc.label}
          d={arc.d}
          fill={arc.color}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: mounted ? "scale(1)" : "scale(0.85)",
            opacity: mounted ? 1 : 0,
            transition: `opacity 0.6s ease ${index * 90}ms, transform 0.6s cubic-bezier(.22,.61,.36,1) ${index * 90}ms`,
          }}
        />
      ))}
      {innerRadius > 0 && <circle cx={cx} cy={cy} r={innerRadius} fill="white" />}
    </svg>
  );
}
