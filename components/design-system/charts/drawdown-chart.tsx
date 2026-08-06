"use client";

import { useEffect, useState } from "react";
import type { PontoDrawdown } from "@/lib/calculos";

type DrawdownChartProps = {
  pontos: PontoDrawdown[];
  idadeEsgotamento: number | null;
  width?: number;
  height?: number;
};

// Gráfico de linha em SVG puro pro drawdown ano a ano (reference
// buildDrawdownChart), com grid horizontal, rótulos de eixo e um marcador no
// ano de esgotamento (se houver).
export function DrawdownChart({
  pontos,
  idadeEsgotamento,
  width = 720,
  height = 280,
}: DrawdownChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (pontos.length === 0) return null;

  const padL = 56;
  const padR = 24;
  const padT = 20;
  const padB = 36;

  const idadeInicio = pontos[0].idade;
  const idadeFim = pontos[pontos.length - 1].idade;
  const maxSaldo = Math.max(...pontos.map((p) => p.saldo)) * 1.08 || 1;

  function xAt(idade: number) {
    const span = idadeFim - idadeInicio || 1;
    return padL + ((idade - idadeInicio) / span) * (width - padL - padR);
  }
  function yAt(saldo: number) {
    return height - padB - (saldo / maxSaldo) * (height - padT - padB);
  }

  const linePath = pontos
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(p.idade)},${yAt(p.saldo)}`)
    .join(" ");
  const areaPath = `${linePath} L${xAt(idadeFim)},${height - padB} L${xAt(idadeInicio)},${height - padB} Z`;

  const corTraco = idadeEsgotamento ? "var(--color-gold)" : "var(--color-green)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolução do patrimônio na aposentadoria, ano a ano">
      {[0, 1, 2, 3, 4].map((g) => {
        const gy = padT + (g * (height - padT - padB)) / 4;
        return (
          <line
            key={g}
            x1={padL}
            x2={width - padR}
            y1={gy}
            y2={gy}
            stroke="#EDF1F7"
            strokeWidth={1}
          />
        );
      })}

      <path
        d={areaPath}
        fill={corTraco}
        opacity={mounted ? 0.08 : 0}
        style={{ transition: "opacity 0.8s ease" }}
      />
      <path
        d={linePath}
        fill="none"
        stroke={corTraco}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={mounted ? 1 : 0}
        style={{ transition: "opacity 0.8s ease" }}
      />

      {idadeEsgotamento != null && (
        <circle
          cx={xAt(idadeEsgotamento)}
          cy={yAt(0)}
          r={5.5}
          fill="var(--color-gold)"
          opacity={mounted ? 1 : 0}
          style={{ transition: "opacity 0.8s ease 0.3s" }}
        />
      )}

      <text x={padL} y={height - 12} fontSize={11.5} fill="#5C6A82">
        {idadeInicio} anos
      </text>
      <text x={width - padR} y={height - 12} textAnchor="end" fontSize={11.5} fill="#5C6A82">
        {idadeFim} anos
      </text>
      {idadeEsgotamento != null && (
        <text
          x={xAt(idadeEsgotamento)}
          y={yAt(0) - 12}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="#a9821f"
        >
          esgota aos {idadeEsgotamento}
        </text>
      )}
    </svg>
  );
}
