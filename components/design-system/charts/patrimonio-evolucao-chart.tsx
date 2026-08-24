"use client";

import { useEffect, useState, type MouseEvent } from "react";
import type { PontoEvolucaoPatrimonio } from "@/lib/calculos";
import { formatarMoeda } from "@/lib/format";
import type { Objetivo } from "@/lib/types/cliente";

type PatrimonioEvolucaoChartProps = {
  pontos: PontoEvolucaoPatrimonio[];
  pontosComparacao?: PontoEvolucaoPatrimonio[];
  idadeAposentadoria: number;
  idadeEsgotamento: number | null;
  objetivos?: Objetivo[];
  mostrarNegativos?: boolean;
  width?: number;
  height?: number;
};

export function pontoMaisProximo(
  pontos: PontoEvolucaoPatrimonio[],
  idade: number,
): PontoEvolucaoPatrimonio {
  return pontos.reduce((melhor, ponto) =>
    Math.abs(ponto.idadeAnos - idade) < Math.abs(melhor.idadeAnos - idade)
      ? ponto
      : melhor,
  );
}

export function anoLabelStep(idadeInicio: number, idadeFim: number): number {
  const span = idadeFim - idadeInicio;
  if (span <= 10) return 1;
  if (span <= 25) return 2;
  return 5;
}

// Gráfico de linha único: labels do eixo são adaptativos pra não virar
// sopa; o detalhe ano-a-ano aparece no hover da curva.
export function PatrimonioEvolucaoChart({
  pontos,
  pontosComparacao,
  idadeAposentadoria,
  idadeEsgotamento,
  objetivos = [],
  mostrarNegativos = false,
  width = 760,
  height = 340,
}: PatrimonioEvolucaoChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<PontoEvolucaoPatrimonio | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (pontos.length === 0) return null;

  const padL = 64;
  const padR = 28;
  const padT = 34;
  const padB = 76;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const idadeInicio = pontos[0].idadeAnos;
  const idadeFim = pontos[pontos.length - 1].idadeAnos;
  const saldos = [...pontos, ...(pontosComparacao ?? [])].map((p) => (mostrarNegativos ? p.saldo : Math.max(0, p.saldo)));
  const maxSaldo = Math.max(...saldos, 1) * 1.08;
  const minSaldo = mostrarNegativos ? Math.min(...saldos, 0) : 0;

  function xAt(idade: number) {
    const span = idadeFim - idadeInicio || 1;
    return padL + ((idade - idadeInicio) / span) * plotW;
  }

  function yAt(saldo: number) {
    const valor = mostrarNegativos ? saldo : Math.max(0, saldo);
    const span = maxSaldo - minSaldo || 1;
    return height - padB - ((valor - minSaldo) / span) * plotH;
  }

  function idadeAtX(x: number) {
    const ratio = Math.min(1, Math.max(0, (x - padL) / plotW));
    return idadeInicio + ratio * (idadeFim - idadeInicio);
  }

  function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * width;
    setHover(pontoMaisProximo(pontos, idadeAtX(x)));
  }

  function pathDe(lista: PontoEvolucaoPatrimonio[]) {
    return lista
      .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(p.idadeAnos)},${yAt(p.saldo)}`)
      .join(" ");
  }

  const pontosAcumulacao = pontos.filter((p) => p.fase === "acumulacao");
  const ultimoPontoAcumulacao = pontosAcumulacao[pontosAcumulacao.length - 1];
  const pontosDrawdown = [
    ...(ultimoPontoAcumulacao ? [ultimoPontoAcumulacao] : []),
    ...pontos.filter((p) => p.fase === "drawdown"),
  ];

  const linePathAcumulacao = pathDe(pontosAcumulacao);
  const linePathDrawdown = pathDe(pontosDrawdown);
  const areaPath = `${pathDe(pontos)} L${xAt(idadeFim)},${height - padB} L${xAt(idadeInicio)},${height - padB} Z`;
  const corDrawdown = idadeEsgotamento ? "var(--color-gold)" : "var(--color-green)";
  const objetivosVisiveis = objetivos.filter((o) => o.horizonte_anos != null && o.horizonte_anos >= 0);
  const patrimonioIdeal = Math.max(...pontos.map((p) => p.saldo), 1);
  const idadeAposentadoriaVisivel = Math.min(Math.max(idadeAposentadoria, idadeInicio), idadeFim);
  const idealPath = `M${xAt(idadeInicio)},${yAt(patrimonioIdeal * 0.08)} L${xAt(idadeAposentadoriaVisivel)},${yAt(patrimonioIdeal)} L${xAt(idadeFim)},${yAt(patrimonioIdeal * 0.55)}`;
  const anosDoEixo = Array.from(
    { length: Math.floor(idadeFim) - Math.ceil(idadeInicio) + 1 },
    (_, i) => Math.ceil(idadeInicio) + i,
  );
  const labelStep = anoLabelStep(idadeInicio, idadeFim);
  const tooltipX = hover ? xAt(hover.idadeAnos) : 0;
  const tooltipY = hover ? yAt(hover.saldo) : 0;
  const tooltipBoxX = Math.min(width - 190, Math.max(8, tooltipX - 86));
  const tooltipBoxY = Math.max(8, tooltipY - 54);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Evolução do patrimônio dos ${Math.round(idadeInicio)} aos ${Math.round(idadeFim)} anos`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
      className="max-w-full"
    >
      <desc>Passe o cursor na linha para ver idade e valor daquele ponto.</desc>

      {[0, 1, 2, 3, 4].map((g) => {
        const gy = padT + (g * plotH) / 4;
        return <line key={g} x1={padL} x2={width - padR} y1={gy} y2={gy} stroke="#EDF1F7" strokeWidth={1} />;
      })}

      {idadeAposentadoria >= idadeInicio && idadeAposentadoria <= idadeFim && (
        <>
          <line
            x1={xAt(idadeAposentadoria)}
            x2={xAt(idadeAposentadoria)}
            y1={padT}
            y2={height - padB}
            stroke="var(--color-navy)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            opacity={mounted ? 0.5 : 0}
          />
          <text x={xAt(idadeAposentadoria)} y={padT - 12} textAnchor="middle" fontSize={11.5} fontWeight={600} fill="var(--color-navy)">
            Aposentadoria ({idadeAposentadoria})
          </text>
        </>
      )}

      <path d={areaPath} fill="var(--color-green)" opacity={mounted ? 0.08 : 0} />
      <path d={areaPath} fill="var(--color-blue)" opacity={mounted ? 0.05 : 0} />
      <path d={idealPath} fill="none" stroke="var(--color-gold)" strokeWidth={2} strokeDasharray="5 5" opacity={mounted ? 1 : 0} />
      {pontosComparacao && (
        <path d={pathDe(pontosComparacao)} fill="none" stroke="var(--color-green)" strokeWidth={2.5} strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" opacity={mounted ? 0.9 : 0} />
      )}
      <path d={linePathAcumulacao} fill="none" stroke="var(--color-blue)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={mounted ? 1 : 0} />
      <path d={linePathDrawdown} fill="none" stroke={corDrawdown} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={mounted ? 1 : 0} />

      {anosDoEixo.map((ano) => {
        const mostrarLabel = ano === Math.round(idadeInicio) || ano === Math.round(idadeFim) || ano % labelStep === 0;
        return (
          <g key={`ano-${ano}`}>
            <line x1={xAt(ano)} x2={xAt(ano)} y1={height - padB} y2={height - padB + 5} stroke="#AAB4C3" opacity={0.8} />
            {mostrarLabel && (
              <text x={xAt(ano)} y={height - 48} textAnchor="middle" fontSize={10.5} fill="#5C6A82">
                {ano}
              </text>
            )}
          </g>
        );
      })}

      {objetivosVisiveis.map((objetivo) => {
        const idadeObjetivo = idadeInicio + (objetivo.horizonte_anos ?? 0);
        if (idadeObjetivo < idadeInicio || idadeObjetivo > idadeFim) return null;
        const ponto = pontoMaisProximo(pontos, idadeObjetivo);
        return (
          <g key={objetivo.id}>
            <circle cx={xAt(idadeObjetivo)} cy={yAt(ponto.saldo)} r={4.5} fill="var(--color-gold)" stroke="white" strokeWidth={2} />
            <text x={xAt(idadeObjetivo)} y={yAt(ponto.saldo) - 10} textAnchor="middle" fontSize={11} fontWeight={600} fill="#a9821f">
              {objetivo.descricao}
            </text>
          </g>
        );
      })}

      {idadeEsgotamento != null && idadeEsgotamento >= idadeInicio && idadeEsgotamento <= idadeFim && (
        <>
          <circle cx={xAt(idadeEsgotamento)} cy={yAt(0)} r={5.5} fill="var(--color-gold)" opacity={mounted ? 1 : 0} />
          <text x={xAt(idadeEsgotamento)} y={yAt(0) - 12} textAnchor="middle" fontSize={12} fontWeight={600} fill="#a9821f">
            esgota aos {idadeEsgotamento}
          </text>
        </>
      )}

      {hover && (
        <g pointerEvents="none">
          <line x1={tooltipX} x2={tooltipX} y1={padT} y2={height - padB} stroke="var(--color-navy)" strokeDasharray="3 3" opacity={0.45} />
          <line x1={padL} x2={width - padR} y1={tooltipY} y2={tooltipY} stroke="var(--color-navy)" strokeDasharray="3 3" opacity={0.25} />
          <circle cx={tooltipX} cy={tooltipY} r={5} fill="var(--color-navy)" stroke="white" strokeWidth={2} />
          <rect x={tooltipBoxX} y={tooltipBoxY} width={172} height={44} rx={12} fill="var(--color-navy)" opacity={0.96} />
          <text x={tooltipBoxX + 12} y={tooltipBoxY + 17} fontSize={11.5} fontWeight={700} fill="white">
            {Math.round(hover.idadeAnos)} anos
          </text>
          <text x={tooltipBoxX + 12} y={tooltipBoxY + 34} fontSize={12.5} fontWeight={700} fill="white">
            {formatarMoeda(hover.saldo)}
          </text>
        </g>
      )}

      <rect x={padL} y={padT} width={plotW} height={plotH} fill="transparent" />

      <g fontSize={11.5} fill="#5C6A82">
        <circle cx={padL} cy={height - 24} r={4} fill="var(--color-blue)" />
        <text x={padL + 10} y={height - 20}>Com objetivos</text>
        <line x1={padL + 128} x2={padL + 148} y1={height - 24} y2={height - 24} stroke="var(--color-green)" strokeWidth={2.5} strokeDasharray="6 4" />
        <text x={padL + 156} y={height - 20}>Sem objetivos</text>
        <line x1={padL + 286} x2={padL + 306} y1={height - 24} y2={height - 24} stroke="var(--color-gold)" strokeWidth={2} strokeDasharray="5 5" />
        <text x={padL + 314} y={height - 20}>Aposentadoria ideal</text>
      </g>
    </svg>
  );
}
