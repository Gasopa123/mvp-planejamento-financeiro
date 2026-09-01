"use client";

import { useEffect, useState } from "react";
import { Card, CardLabel } from "@/components/design-system/card";
import { RangeSlider } from "@/components/design-system/range-slider";
import { PercentField } from "@/components/design-system/percent-field";
import { VerdictCard } from "@/components/design-system/verdict-card";
import { PatrimonioEvolucaoChart } from "@/components/design-system/charts/patrimonio-evolucao-chart";
import {
  aplicarObjetivosNaCurva,
  capacidadeInvestimento,
  compararCenariosAposentadoria,
  explicarTendenciaPatrimonio,
  impactoObjetivos,
  simularEvolucaoPatrimonio,
  simularStressTestAposentadoria,
  taxaRealIpcaMais,
  taxaRealPercentualCdi,
  taxaRealPrefixada,
  updateIndicators,
  type PontoEvolucaoPatrimonio,
} from "@/lib/calculos";
import { resolverAssumptions } from "@/lib/assumptions";
import { formatarMoeda } from "@/lib/format";
import type { Assumptions, Cliente, Objetivo } from "@/lib/types/cliente";

type SimulacoesTabProps = {
  cliente: Cliente;
  objetivos: Objetivo[];
  assumptions: Assumptions | null;
};

type TipoRentabilidade = "ipca_mais" | "percentual_cdi" | "prefixado";

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

export function pontosAteHorizonte(
  pontos: PontoEvolucaoPatrimonio[],
  idadeMaxima: number,
): PontoEvolucaoPatrimonio[] {
  const filtrados = pontos.filter((p) => p.idadeAnos <= idadeMaxima);
  return filtrados.length > 0 ? filtrados : pontos.slice(0, 1);
}

export function SimulacoesTab({ cliente, objetivos, assumptions }: SimulacoesTabProps) {
  const { idade, idade_aposentadoria: idadeAposentadoria, expectativa_vida: expectativaVida } =
    cliente;
  const { inflacaoProjetadaPct, cdiAtualPct, rentabilidadeRealPadraoPct } =
    resolverAssumptions(assumptions);

  const capacidadeAtual =
    cliente.renda_mensal != null && cliente.despesa_mensal != null
      ? Math.max(0, capacidadeInvestimento(cliente.renda_mensal, cliente.despesa_mensal))
      : 500;
  const impactoDosObjetivos = impactoObjetivos(
    objetivos,
    capacidadeAtual,
    cliente.patrimonio_investido ?? 0,
    inflacaoProjetadaPct,
  );
  // O aporte parte da capacidade cheia, não da restante depois dos objetivos:
  // na curva os objetivos já saem como retirada pontual no ano em que vencem
  // (ver aplicarObjetivosNaCurva). Descontá-los também do aporte mensal
  // contaria o mesmo objetivo duas vezes. O impacto mensal continua no card
  // de objetivos logo abaixo, como leitura alternativa.
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

  // Sem tempo de acumulação não há cenário pra simular: melhor dizer que o
  // dado está inconsistente do que desenhar uma curva e um veredito que não
  // significam nada.
  if (idadeAposentadoria <= idade) {
    return (
      <Card>
        <p className="text-sm text-ink-60">
          A idade de aposentadoria cadastrada ({idadeAposentadoria} anos) é
          menor ou igual à idade atual ({idade} anos) — corrija esse dado pra
          simular cenários.
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

  const horizonteSelecionado = HORIZONTES.find((h) => h.id === horizonte) ?? HORIZONTES[3];
  const idadeMaxima = horizonteSelecionado.anos == null ? 100 : idade + horizonteSelecionado.anos;
  const resultado = simularEvolucaoPatrimonio(
    idade,
    idadeAposentadoria,
    cliente.patrimonio_investido ?? 0,
    aporte,
    rendaDesejada,
    rentabilidadeReal,
    100,
  );
  const resultadoSemObjetivos = simularEvolucaoPatrimonio(
    idade,
    idadeAposentadoria,
    cliente.patrimonio_investido ?? 0,
    capacidadeAtual,
    rendaDesejada,
    rentabilidadeReal,
    100,
  );
  const valorDaRecomendacao = compararCenariosAposentadoria({
    idadeAtual: idade,
    idadeAposentadoria,
    patrimonioInicial: cliente.patrimonio_investido ?? 0,
    aporteMensalAtual: 0,
    aporteMensalRecomendado: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    taxaAnualPct: rentabilidadeReal,
  });
  const stressTests = simularStressTestAposentadoria({
    idadeAtual: idade,
    idadeAposentadoria,
    expectativaVida,
    patrimonioInicial: cliente.patrimonio_investido ?? 0,
    aporteMensal: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    taxaAnualPct: rentabilidadeReal,
  });
  // Linha "Com objetivos": cada objetivo com valor e prazo sai do patrimônio
  // no ano em que vence, e a curva segue a partir do saldo já reduzido. A
  // linha de comparação ("Sem objetivos") continua sem esses descontos — é
  // justamente a diferença entre as duas que mostra o custo dos objetivos.
  const curvaComObjetivos = aplicarObjetivosNaCurva(
    resultado.pontos,
    objetivos,
    rentabilidadeReal,
  );
  const pontosDaCurva = pontosAteHorizonte(curvaComObjetivos.pontos, idadeMaxima);
  const pontosSemObjetivos = pontosAteHorizonte(resultadoSemObjetivos.pontos, idadeMaxima);
  // Esgotamento e patrimônio na aposentadoria vêm da curva já descontada,
  // pro número e o gráfico não contarem histórias diferentes.
  const idadeEsgotamento =
    curvaComObjetivos.idadeEsgotamento ?? resultado.idadeEsgotamento;
  const patrimonioNaAposentadoria =
    curvaComObjetivos.pontos.find(
      (ponto) => ponto.idadeAnos >= resultado.idadeAposentadoria,
    )?.saldo ?? resultado.patrimonioNaAposentadoria;
  const sustentavel = idadeEsgotamento == null || idadeEsgotamento >= expectativaVida;
  // Saldos reais da curva simulada — a tendência (subiu/caiu/estável) é lida
  // deles, e não de idadeEsgotamento: não zerar até o fim da simulação não
  // quer dizer que o principal tenha sido preservado.
  const ultimoPontoSimulado =
    curvaComObjetivos.pontos[curvaComObjetivos.pontos.length - 1];
  const explicacaoTendencia = explicarTendenciaPatrimonio({
    aporteMensal: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    idadeEsgotamento,
    expectativaVida,
    saldoInicioAposentadoria: patrimonioNaAposentadoria,
    saldoFinalSimulacao: ultimoPontoSimulado?.saldo ?? patrimonioNaAposentadoria,
    idadeFinalSimulacao: Math.round(ultimoPontoSimulado?.idadeAnos ?? 100),
  });

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
        <CardLabel>Objetivos — leitura alternativa (poupar mês a mês)</CardLabel>
        <p className="mb-3 text-xs text-ink-40">
          Na curva acima os objetivos saem do patrimônio de uma vez, no ano em
          que vencem. Os números abaixo mostram o outro caminho: reservar um
          valor todo mês até lá. São formas alternativas de pagar o mesmo
          objetivo — não se somam.
        </p>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-ink-60">Aporte reservado a objetivos</span>
            <b className="block text-navy">{formatarMoeda(impactoDosObjetivos.aporteMensalObjetivos)}</b>
          </div>
          <div>
            <span className="text-ink-60">Livre para aposentadoria</span>
            <b className={impactoDosObjetivos.capacidadeRestante >= 0 ? "block text-green-ink" : "block text-gold-ink"}>
              {formatarMoeda(impactoDosObjetivos.capacidadeRestante)}
            </b>
          </div>
          <div>
            <span className="text-ink-60">Patrimônio após objetivos</span>
            <b className={impactoDosObjetivos.patrimonioDepoisObjetivos >= 0 ? "block text-navy" : "block text-gold-ink"}>
              {formatarMoeda(impactoDosObjetivos.patrimonioDepoisObjetivos)}
            </b>
          </div>
        </div>
      </Card>

      <Card>
        <CardLabel>Valor da recomendação</CardLabel>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <span className="text-ink-60">Cenário atual</span>
            <b className="block text-ink">{formatarMoeda(valorDaRecomendacao.atual)}</b>
          </div>
          <div>
            <span className="text-ink-60">Cenário recomendado</span>
            <b className="block text-navy">{formatarMoeda(valorDaRecomendacao.recomendado)}</b>
          </div>
          <div>
            <span className="text-ink-60">Valor criado até a aposentadoria</span>
            <b className={valorDaRecomendacao.valorCriado >= 0 ? "block text-green-ink" : "block text-gold-ink"}>
              {formatarMoeda(valorDaRecomendacao.valorCriado)}
            </b>
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-40">
          Compara manter só o patrimônio atual investido contra investir o aporte recomendado nesta simulação.
        </p>
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
        <CardLabel>Stress test</CardLabel>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-5">
          {stressTests.map((cenario) => (
            <div key={cenario.nome} className="rounded-xl border border-line p-3">
              <span className="block text-xs font-semibold text-ink-60">{cenario.nome}</span>
              <b className="mt-1 block text-navy">{formatarMoeda(cenario.patrimonioNaAposentadoria)}</b>
              <span className="mt-1 block text-xs text-ink-40">
                {cenario.idadeEsgotamento == null
                  ? `sustenta até ${cenario.idadeReferencia}`
                  : `esgota aos ${cenario.idadeEsgotamento}`}
              </span>
            </div>
          ))}
        </div>
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
            idadeAposentadoria={resultado.idadeAposentadoria}
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
