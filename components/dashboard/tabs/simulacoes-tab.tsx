"use client";

import { useEffect, useState } from "react";
import { Card, CardLabel } from "@/components/design-system/card";
import { RangeSlider } from "@/components/design-system/range-slider";
import { PercentField } from "@/components/design-system/percent-field";
import { VerdictCard } from "@/components/design-system/verdict-card";
import { PatrimonioEvolucaoChart } from "@/components/design-system/charts/patrimonio-evolucao-chart";
import {
  capacidadeInvestimento,
  simularEvolucaoPatrimonio,
  taxaRealIpcaMais,
  taxaRealPercentualCdi,
  taxaRealPrefixada,
  updateIndicators,
} from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente } from "@/lib/types/cliente";

type SimulacoesTabProps = {
  cliente: Cliente;
  assumptions: Assumptions | null;
};

type TipoRentabilidade = "ipca_mais" | "percentual_cdi" | "prefixado";

const TIPOS_RENTABILIDADE: { id: TipoRentabilidade; label: string }[] = [
  { id: "ipca_mais", label: "IPCA+" },
  { id: "percentual_cdi", label: "% do CDI" },
  { id: "prefixado", label: "Prefixado" },
];

export function SimulacoesTab({ cliente, assumptions }: SimulacoesTabProps) {
  const { idade, idade_aposentadoria: idadeAposentadoria, expectativa_vida: expectativaVida } =
    cliente;
  const { inflacaoProjetadaPct, cdiAtualPct, rentabilidadeRealPadraoPct } =
    resolverAssumptions(assumptions);

  const capacidadeAtual =
    cliente.renda_mensal != null && cliente.despesa_mensal != null
      ? Math.max(0, capacidadeInvestimento(cliente.renda_mensal, cliente.despesa_mensal))
      : 500;

  const [aporte, setAporte] = useState(Math.round(capacidadeAtual / 50) * 50 || 500);
  const [rendaDesejada, setRendaDesejada] = useState(
    cliente.pretensao_salarial_aposentadoria ?? cliente.renda_mensal ?? 5000,
  );

  // Cada tipo de rentabilidade tem seu próprio campo, com valor
  // independente — trocar o tipo selecionado nunca recalcula ou sincroniza
  // os outros dois, porque são produtos de investimento diferentes.
  const [tipoRentabilidade, setTipoRentabilidade] =
    useState<TipoRentabilidade>("ipca_mais");
  const [spreadIpcaPct, setSpreadIpcaPct] = useState(rentabilidadeRealPadraoPct);

  // Os valores iniciais de %CDI e Prefixado são só um ponto de partida
  // coerente com a premissa padrão (reaproveitando updateIndicators, que
  // converte uma rentabilidade real nas notações equivalentes) — a partir
  // daí cada campo vive a vida dele.
  const indicadoresIniciais = updateIndicators(
    rentabilidadeRealPadraoPct,
    inflacaoProjetadaPct,
    cdiAtualPct,
  );
  const [percentualCdiPct, setPercentualCdiPct] = useState(
    indicadoresIniciais.percentualDoCdi,
  );
  const [prefixadaPct, setPrefixadaPct] = useState(
    indicadoresIniciais.taxaNominalPrefixada,
  );

  const [cdiAtualEditavel, setCdiAtualEditavel] = useState(cdiAtualPct);
  const [inflacaoEditavel, setInflacaoEditavel] = useState(inflacaoProjetadaPct);
  const [indicadoresAtualizadosEm, setIndicadoresAtualizadosEm] = useState<string | null>(null);

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

  if (idade == null || idadeAposentadoria == null || expectativaVida == null) {
    return (
      <Card>
        <p className="text-sm text-ink-60">
          Idade, idade de aposentadoria e/ou expectativa de vida não
          informadas — cadastre esses dados pra simular cenários.
        </p>
      </Card>
    );
  }

  // A rentabilidade real usada em toda a simulação vem só do tipo
  // atualmente selecionado — os outros dois campos ficam guardados, mas não
  // entram na conta enquanto não forem selecionados.
  const rentabilidadeReal =
    tipoRentabilidade === "ipca_mais"
      ? taxaRealIpcaMais(spreadIpcaPct)
      : tipoRentabilidade === "percentual_cdi"
        ? taxaRealPercentualCdi(percentualCdiPct, cdiAtualEditavel, inflacaoEditavel)
        : taxaRealPrefixada(prefixadaPct, inflacaoEditavel);

  const resultado = simularEvolucaoPatrimonio(
    idade,
    idadeAposentadoria,
    cliente.patrimonio_investido ?? 0,
    aporte,
    rendaDesejada,
    rentabilidadeReal,
    100,
  );
  const { idadeEsgotamento, patrimonioNaAposentadoria } = resultado;
  const sustentavel = idadeEsgotamento == null || idadeEsgotamento >= expectativaVida;

  const limiteAporte = Math.max(2500, Math.round(capacidadeAtual * 2));
  const limiteRenda = 1_000_000;

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

      <Card>
        <CardLabel>Patrimônio estimado ao se aposentar</CardLabel>
        <div className="font-display text-3xl font-semibold text-navy">
          {formatarMoeda(patrimonioNaAposentadoria)}
        </div>
      </Card>

      <VerdictCard
        positivo={sustentavel}
        titulo={
          idadeEsgotamento == null
            ? "Patrimônio sustenta até os 100 anos"
            : sustentavel
              ? `Patrimônio dura até os ${idadeEsgotamento} anos`
              : `Patrimônio se esgota aos ${idadeEsgotamento} anos`
        }
        subtitulo={
          idadeEsgotamento == null
            ? "Com esse cenário, o saldo nunca se esgota até os 100 anos simulados."
            : sustentavel
              ? `Cobre a expectativa de vida de ${expectativaVida} anos.`
              : `Isso é ${expectativaVida - idadeEsgotamento} ano(s) antes da expectativa de vida de ${expectativaVida} anos.`
        }
        badgeLabel={sustentavel ? "Objetivo atingido" : "Requer ajuste"}
      />

      <Card>
        <CardLabel>Evolução do patrimônio: acumulação e aposentadoria</CardLabel>
        <PatrimonioEvolucaoChart
          pontos={resultado.pontos}
          idadeAposentadoria={resultado.idadeAposentadoria}
          idadeEsgotamento={idadeEsgotamento}
        />
      </Card>
    </div>
  );
}
