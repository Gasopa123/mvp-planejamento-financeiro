"use client";

import { useEffect, useState } from "react";
import { Card, CardLabel } from "@/components/design-system/card";
import { RangeSlider } from "@/components/design-system/range-slider";
import { PercentField } from "@/components/design-system/percent-field";
import { VerdictCard } from "@/components/design-system/verdict-card";
import { PatrimonioEvolucaoChart } from "@/components/design-system/charts/patrimonio-evolucao-chart";
import { ResultadosDoCenario } from "./simulacoes-resultados";
import {
  basesDaSimulacao,
  derivarCenarioSimulado,
  validarDadosDaSimulacao,
  type TipoRentabilidade,
} from "@/lib/simulacao";
import { temObjetivoFuturoComPrazo } from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente, Objetivo } from "@/lib/types/cliente";

// A conta mora em @/lib/simulacao; a aba segue exportando o mesmo nome de
// antes para quem já importava daqui.
export { pontosAteHorizonte } from "@/lib/simulacao";

type SimulacoesTabProps = {
  cliente: Cliente;
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

const TIPOS_RENTABILIDADE: { id: TipoRentabilidade; label: string }[] = [
  { id: "ipca_mais", label: "IPCA+" },
  { id: "percentual_cdi", label: "% do CDI" },
  { id: "prefixado", label: "Prefixado" },
];

const HORIZONTES = [
  { id: "2", label: "2 anos", anos: 2 },
  { id: "5", label: "5 anos", anos: 5 },
  { id: "10", label: "10 anos", anos: 10 },
  { id: "max", label: "Máximo", anos: null },
] as const;

type HorizonteId = (typeof HORIZONTES)[number]["id"];

export function SimulacoesTab({ cliente, objetivos, assumptions }: SimulacoesTabProps) {
  const dados = validarDadosDaSimulacao(cliente);
  const { inflacaoProjetadaPct, cdiAtualPct, rentabilidadeRealPadraoPct } =
    resolverAssumptions(assumptions);

  const {
    capacidadeAtual,
    impactoDosObjetivos,
    aporteInicial,
    rendaDesejadaInicial,
    percentualCdiInicial,
    prefixadaInicial,
  } = basesDaSimulacao({
    cliente,
    objetivos,
    inflacaoProjetadaPct,
    cdiAtualPct,
    rentabilidadeRealPadraoPct,
  });

  const [aporte, setAporte] = useState(aporteInicial);
  const [rendaDesejada, setRendaDesejada] = useState(rendaDesejadaInicial);

  // Cada tipo de rentabilidade tem seu próprio campo, com valor
  // independente — trocar o tipo selecionado nunca recalcula ou sincroniza
  // os outros dois, porque são produtos de investimento diferentes.
  const [tipoRentabilidade, setTipoRentabilidade] =
    useState<TipoRentabilidade>("ipca_mais");
  const [spreadIpcaPct, setSpreadIpcaPct] = useState(rentabilidadeRealPadraoPct);
  const [percentualCdiPct, setPercentualCdiPct] = useState(percentualCdiInicial);
  const [prefixadaPct, setPrefixadaPct] = useState(prefixadaInicial);

  const [cdiAtualEditavel, setCdiAtualEditavel] = useState(cdiAtualPct);
  const [inflacaoEditavel, setInflacaoEditavel] = useState(inflacaoProjetadaPct);
  const [indicadoresAtualizadosEm, setIndicadoresAtualizadosEm] = useState<string | null>(null);
  const [horizonte, setHorizonte] = useState<HorizonteId>("max");
  const [mostrarNegativos, setMostrarNegativos] = useState(false);

  useEffect(() => {
    let cancelado = false;
    fetch("/api/indicadores")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { cdiAtualPct?: number; inflacaoProjetadaPct?: number; atualizadoEm?: string } | null) => {
        if (cancelado || !data) return;
        if (typeof data.cdiAtualPct === "number") setCdiAtualEditavel(data.cdiAtualPct);
        if (typeof data.inflacaoProjetadaPct === "number") setInflacaoEditavel(data.inflacaoProjetadaPct);
        setIndicadoresAtualizadosEm(data.atualizadoEm ?? null);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, []);

  if (!dados.ok) {
    return (
      <Card>
        <p className="text-sm text-ink-60">{dados.mensagem}</p>
      </Card>
    );
  }
  const { idade, idadeAposentadoria, expectativaVida } = dados;

  const horizonteSelecionado = HORIZONTES.find((h) => h.id === horizonte) ?? HORIZONTES[3];
  const {
    rentabilidadeReal,
    idadeAposentadoria: idadeAposentadoriaDaCurva,
    pontosDaCurva,
    pontosSemObjetivos,
    idadeDeficitPreAposentadoria,
    idadeEsgotamento,
    patrimonioNaAposentadoria,
    sustentavel,
    explicacaoTendencia,
    valorDaRecomendacao,
    stressTests,
    limiteAporte,
    limiteRenda,
  } = derivarCenarioSimulado({
    idade,
    idadeAposentadoria,
    expectativaVida,
    patrimonioInicial: cliente.patrimonio_investido ?? 0,
    objetivos,
    capacidadeAtual,
    aporte,
    rendaDesejada,
    tipoRentabilidade,
    spreadIpcaPct,
    percentualCdiPct,
    prefixadaPct,
    cdiAtualPct: cdiAtualEditavel,
    inflacaoParaTaxaRealPct: inflacaoEditavel,
    inflacaoProjetadaPct,
    anosDoHorizonte: horizonteSelecionado.anos,
  });

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <CardLabel>Ajuste o cenário</CardLabel>

        <RangeSlider
          label="Aporte mensal até a aposentadoria"
          value={aporte}
          min={0}
          max={limiteAporte}
          step={50}
          onChange={setAporte}
          formatValue={formatarMoeda}
        />
        <RangeSlider
          label="Renda mensal desejada na aposentadoria"
          value={rendaDesejada}
          min={1000}
          max={limiteRenda}
          step={250}
          onChange={setRendaDesejada}
          formatValue={formatarMoeda}
        />

        <div className="border-t border-line pt-5">
          <CardLabel>Tipo de rentabilidade</CardLabel>
          <div className="mb-4 flex flex-wrap gap-2">
            {TIPOS_RENTABILIDADE.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                onClick={() => setTipoRentabilidade(tipo.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  tipoRentabilidade === tipo.id
                    ? "bg-navy text-white"
                    : "bg-white text-ink-60 border border-line hover:bg-blue-soft hover:text-blue"
                }`}
              >
                {tipo.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <PercentField
              label="IPCA+ (spread)"
              value={spreadIpcaPct}
              onChange={setSpreadIpcaPct}
              active={tipoRentabilidade === "ipca_mais"}
            />
            <PercentField
              label="% do CDI"
              value={percentualCdiPct}
              onChange={setPercentualCdiPct}
              step={1}
              active={tipoRentabilidade === "percentual_cdi"}
            />
            <PercentField
              label="Prefixado"
              value={prefixadaPct}
              onChange={setPrefixadaPct}
              active={tipoRentabilidade === "prefixado"}
            />
          </div>

          <p className="mt-3 text-xs text-ink-40">
            Rentabilidade real usada na simulação: {rentabilidadeReal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% a.a.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CardLabel>IPCA/CDI automáticos</CardLabel>
            <p className="text-xs text-ink-40">
              Fonte: Banco Central SGS. Campos continuam editáveis manualmente, com 2 casas decimais.
              {indicadoresAtualizadosEm ? ` Atualizado em ${indicadoresAtualizadosEm}.` : ""}
            </p>
          </div>
          <PercentField
            label="CDI atual"
            value={cdiAtualEditavel}
            onChange={setCdiAtualEditavel}
          />
          <PercentField
            label="Inflação projetada (IPCA)"
            value={inflacaoEditavel}
            onChange={setInflacaoEditavel}
          />
        </div>
      </Card>

      <ResultadosDoCenario
        impactoDosObjetivos={impactoDosObjetivos}
        valorDaRecomendacao={valorDaRecomendacao}
        patrimonioNaAposentadoria={patrimonioNaAposentadoria}
        idadeDeficitPreAposentadoria={idadeDeficitPreAposentadoria}
      />

      <VerdictCard
        positivo={sustentavel}
        titulo={
          idadeDeficitPreAposentadoria != null
            ? `Os objetivos comprometem o patrimônio aos ${idadeDeficitPreAposentadoria} anos`
            : idadeEsgotamento == null
              ? "Patrimônio sustenta até os 100 anos"
              : sustentavel
                ? `Patrimônio dura até os ${idadeEsgotamento} anos`
                : `Patrimônio se esgota aos ${idadeEsgotamento} anos`
        }
        subtitulo={
          idadeDeficitPreAposentadoria != null
            ? "Os objetivos comprometem o patrimônio antes da aposentadoria. Revise prazo, valor ou aporte."
            : idadeEsgotamento == null
              ? "Com esse cenário, o saldo nunca se esgota até os 100 anos simulados."
              : sustentavel
                ? `Cobre a expectativa de vida de ${expectativaVida} anos.`
                : `Isso é ${expectativaVida - idadeEsgotamento} ano(s) antes da expectativa de vida de ${expectativaVida} anos.`
        }
        badgeLabel={sustentavel ? "Objetivo atingido" : "Requer ajuste"}
      />

      <Card>
        <CardLabel>Stress test</CardLabel>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-5">
          {stressTests.map((cenario) => (
            <div key={cenario.nome} className="rounded-xl border border-line p-3">
              <span className="block text-xs font-semibold text-ink-60">{cenario.nome}</span>
              <b className={cenario.patrimonioNaAposentadoria < 0 ? "mt-1 block text-gold-ink" : "mt-1 block text-navy"}>{formatarMoeda(cenario.patrimonioNaAposentadoria)}</b>
              <span className="mt-1 block text-xs text-ink-40">
                {cenario.idadeDeficitPreAposentadoria != null
                  ? `objetivos comprometem aos ${cenario.idadeDeficitPreAposentadoria}`
                  : cenario.idadeEsgotamento == null
                    ? `sustenta até ${cenario.idadeReferencia}`
                    : `esgota aos ${cenario.idadeEsgotamento}`}
              </span>
            </div>
          ))}
        </div>
        {/* Com o plano furado antes da aposentadoria, o número de cada cartão
            mede o tamanho do buraco: rentabilidade menor capitaliza menos e o
            cenário pior aparece com valor maior. Comparar choques só faz
            sentido depois de resolver o déficit. */}
        {stressTests.every((c) => c.idadeDeficitPreAposentadoria != null) && (
          <p className="mt-3 text-xs text-ink-40">
            Todos os cenários comprometem o patrimônio antes da aposentadoria; antes de comparar choques, revise prazo, valor dos objetivos ou aporte.
          </p>
        )}
        {!temObjetivoFuturoComPrazo(objetivos) && (
          <p className="mt-3 text-xs text-ink-40">
            Sem objetivos futuros com prazo, o choque de inflação não altera esta projeção.
          </p>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardLabel>Curva única do futuro financeiro</CardLabel>
            <p className="text-sm text-ink-60">
              Patrimônio, aposentadoria e objetivos na mesma linha do tempo.
              Cada objetivo com valor e prazo sai do patrimônio no ano em que
              vence — é projeção com as premissas informadas, não promessa.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-60">
            <input
              type="checkbox"
              checked={mostrarNegativos}
              onChange={(event) => setMostrarNegativos(event.target.checked)}
            />
            Mostrar negativos
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {HORIZONTES.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHorizonte(h.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                horizonte === h.id
                  ? "bg-navy text-white"
                  : "border border-line bg-white text-ink-60 hover:bg-blue-soft hover:text-blue"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <PatrimonioEvolucaoChart
            pontos={pontosDaCurva}
            pontosComparacao={pontosSemObjetivos}
            idadeAposentadoria={idadeAposentadoriaDaCurva}
            idadeEsgotamento={idadeEsgotamento}
            objetivos={objetivos}
            mostrarNegativos={mostrarNegativos}
          />
        </div>
        <p className="mt-3 text-sm text-ink-60">{explicacaoTendencia}</p>
      </Card>
    </div>
  );
}
