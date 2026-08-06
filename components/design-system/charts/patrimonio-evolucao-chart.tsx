"use client";

import { useEffect, useState } from "react";
import type { PontoEvolucaoPatrimonio } from "@/lib/calculos";

type PatrimonioEvolucaoChartProps = {
  pontos: PontoEvolucaoPatrimonio[];
  idadeAposentadoria: number;
  idadeEsgotamento: number | null;
  width?: number;
  height?: number;
};

// Gráfico de linha único e contínuo: acumulação (mês a mês, até a
// aposentadoria) e drawdown (ano a ano, dali até idadeMaxima ou o
// esgotamento) no mesmo traçado, com a aposentadoria marcada como ponto de
// virada e o esgotamento (se houver) destacado como veredito.
export function PatrimonioEvolucaoChart({
  pontos,
  idadeAposentadoria,
  idadeEsgotamento,
  width = 760,
  height = 300,
}: PatrimonioEvolucaoChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (pontos.length === 0) return null;

  const padL = 60;
  const padR = 24;
  const padT = 28;
  const padB = 36;

  const idadeInicio = pontos[0].idadeAnos;
  const idadeFim = pontos[pontos.length - 1].idadeAnos;
  const maxSaldo = Math.max(...pontos.map((p) => p.saldo)) * 1.08 || 1;

  function xAt(idade: number) {
    const span = idadeFim - idadeInicio || 1;
    return padL + ((idade - idadeInicio) / span) * (width - padL - padR);
  }
  function yAt(saldo: number) {
    return height - padB - (saldo / maxSaldo) * (height - padT - padB);
  }

  const pontosAcumulacao = pontos.filter((p) => p.fase === "acumulacao");
  const ultimoPontoAcumulacao = pontosAcumulacao[pontosAcumulacao.length - 1];
  // Prefixa o último ponto de acumulação pra ligar as duas fases sem gap visual.
  const pontosDrawdown = [
    ...(ultimoPontoAcumulacao ? [ultimoPontoAcumulacao] : []),
    ...pontos.filter((p) => p.fase === "drawdown"),
  ];

  function pathDe(lista: PontoEvolucaoPatrimonio[]) {
    return lista
      .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(p.idadeAnos)},${yAt(p.saldo)}`)
      .join(" ");
  }

  const linePathAcumulacao = pathDe(pontosAcumulacao);
  const linePathDrawdown = pathDe(pontosDrawdown);
  const areaPath = `${pathDe(pontos)} L${xAt(idadeFim)},${height - padB} L${xAt(idadeInicio)},${height - padB} Z`;

  const corDrawdown = idadeEsgotamento ? "var(--color-gold)" : "var(--color-green)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Evolução do patrimônio dos ${Math.round(idadeInicio)} aos ${Math.round(idadeFim)} anos, com a aposentadoria aos ${idadeAposentadoria} anos como ponto de virada`}
    >
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

      {/* linha vertical + rótulo marcando a aposentadoria como ponto de virada */}
      <line
        x1={xAt(idadeAposentadoria)}
        x2={xAt(idadeAposentadoria)}
        y1={padT}
        y2={height - padB}
        stroke="var(--color-navy)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
        opacity={mounted ? 0.5 : 0}
        style={{ transition: "opacity 0.8s ease" }}
      />
      <text
        x={xAt(idadeAposentadoria)}
        y={padT - 10}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={600}
        fill="var(--color-navy)"
      >
        Aposentadoria ({idadeAposentadoria})
      </text>

      <path
        d={areaPath}
        fill={corDrawdown}
        opacity={mounted ? 0.06 : 0}
        style={{ transition: "opacity 0.8s ease" }}
      />

      <path
        d={linePathAcumulacao}
        fill="none"
        stroke="var(--color-blue)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={mounted ? 1 : 0}
        style={{ transition: "opacity 0.8s ease" }}
      />
      <path
        d={linePathDrawdown}
        fill="none"
        stroke={corDrawdown}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={mounted ? 1 : 0}
        style={{ transition: "opacity 0.8s ease" }}
      />

      {idadeEsgotamento != null && (
        <>
          <circle
            cx={xAt(idadeEsgotamento)}
            cy={yAt(0)}
            r={5.5}
            fill="var(--color-gold)"
            opacity={mounted ? 1 : 0}
            style={{ transition: "opacity 0.8s ease 0.3s" }}
          />
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
        </>
      )}

      <text x={padL} y={height - 12} fontSize={11.5} fill="#5C6A82">
        {Math.round(idadeInicio)} anos
      </text>
      <text x={width - padR} y={height - 12} textAnchor="end" fontSize={11.5} fill="#5C6A82">
        {Math.round(idadeFim)} anos
      </text>
    </svg>
  );
}
