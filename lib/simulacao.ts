// Derivação do cenário da aba de Simulações.
//
// A aba mexe em sliders e campos; quem transforma esses valores em curva,
// veredito e stress test é este módulo. São funções puras: mesma entrada,
// mesma saída, sem estado de React e sem formatação — a tela só exibe o
// resultado (ver .agent-skills/design.md).
//
// A matemática em si continua em ./calculos; aqui só se orquestra a ordem
// das chamadas e as decisões de leitura que a tela precisa.

import {
  capacidadeInvestimento,
  compararCenariosAposentadoria,
  explicarTendenciaPatrimonio,
  impactoObjetivos,
  projetarPatrimonioComObjetivos,
  simularEvolucaoPatrimonio,
  simularStressTestAposentadoria,
  taxaRealIpcaMais,
  taxaRealPercentualCdi,
  taxaRealPrefixada,
  updateIndicators,
  type PontoEvolucaoPatrimonio,
} from "./calculos";
import type { Cliente, Objetivo } from "./types/cliente";

export type TipoRentabilidade = "ipca_mais" | "percentual_cdi" | "prefixado";

export type BasesDaSimulacaoInput = {
  cliente: Cliente;
  objetivos: Objetivo[];
  inflacaoProjetadaPct: number;
  cdiAtualPct: number;
  rentabilidadeRealPadraoPct: number;
};

/**
 * Valores de partida da simulação: o que o cliente consegue investir hoje,
 * o custo dos objetivos e os pontos iniciais de cada campo de rentabilidade.
 */
export function basesDaSimulacao({
  cliente,
  objetivos,
  inflacaoProjetadaPct,
  cdiAtualPct,
  rentabilidadeRealPadraoPct,
}: BasesDaSimulacaoInput) {
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
  // Os valores iniciais de %CDI e Prefixado são só um ponto de partida
  // coerente com a premissa padrão (reaproveitando updateIndicators, que
  // converte uma rentabilidade real nas notações equivalentes) — a partir
  // daí cada campo vive a vida dele.
  const indicadoresIniciais = updateIndicators(
    rentabilidadeRealPadraoPct,
    inflacaoProjetadaPct,
    cdiAtualPct,
  );
  return {
    capacidadeAtual,
    impactoDosObjetivos,
    // O aporte parte da capacidade cheia, não da restante depois dos
    // objetivos: na curva os objetivos já saem como retirada pontual no ano
    // em que vencem (ver aplicarObjetivosNaCurva). Descontá-los também do
    // aporte mensal contaria o mesmo objetivo duas vezes.
    aporteInicial: Math.round(capacidadeAtual / 50) * 50 || 500,
    rendaDesejadaInicial:
      cliente.pretensao_salarial_aposentadoria ?? cliente.renda_mensal ?? 5000,
    percentualCdiInicial: indicadoresIniciais.percentualDoCdi,
    prefixadaInicial: indicadoresIniciais.taxaNominalPrefixada,
  };
}

export function pontosAteHorizonte(
  pontos: PontoEvolucaoPatrimonio[],
  idadeMaxima: number,
): PontoEvolucaoPatrimonio[] {
  const filtrados = pontos.filter((p) => p.idadeAnos <= idadeMaxima);
  return filtrados.length > 0 ? filtrados : pontos.slice(0, 1);
}

export type CenarioSimuladoInput = {
  idade: number;
  idadeAposentadoria: number;
  expectativaVida: number;
  patrimonioInicial: number;
  objetivos: Objetivo[];
  capacidadeAtual: number;
  aporte: number;
  rendaDesejada: number;
  tipoRentabilidade: TipoRentabilidade;
  spreadIpcaPct: number;
  percentualCdiPct: number;
  prefixadaPct: number;
  cdiAtualPct: number;
  inflacaoPct: number;
  /** Anos à frente escolhidos no seletor de horizonte; null = simulação inteira. */
  anosDoHorizonte: number | null;
};

/**
 * Roda a simulação inteira do cenário ajustado na tela e devolve tudo que a
 * aba precisa mostrar: curva, comparação sem objetivos, veredito de
 * sustentabilidade, stress test e os limites dos sliders.
 */
export function derivarCenarioSimulado(input: CenarioSimuladoInput) {
  const {
    idade,
    idadeAposentadoria,
    expectativaVida,
    patrimonioInicial,
    objetivos,
    capacidadeAtual,
    aporte,
    rendaDesejada,
    tipoRentabilidade,
    spreadIpcaPct,
    percentualCdiPct,
    prefixadaPct,
    cdiAtualPct,
    inflacaoPct,
    anosDoHorizonte,
  } = input;

  // A rentabilidade real usada em toda a simulação vem só do tipo
  // atualmente selecionado — os outros dois campos ficam guardados, mas não
  // entram na conta enquanto não forem selecionados.
  const rentabilidadeReal =
    tipoRentabilidade === "ipca_mais"
      ? taxaRealIpcaMais(spreadIpcaPct)
      : tipoRentabilidade === "percentual_cdi"
        ? taxaRealPercentualCdi(percentualCdiPct, cdiAtualPct, inflacaoPct)
        : taxaRealPrefixada(prefixadaPct, inflacaoPct);

  const idadeMaxima = anosDoHorizonte == null ? 100 : idade + anosDoHorizonte;
  // Mesma projeção usada por Aposentadoria, Plano de ação e apresentação —
  // uma história só pro cliente (ver projetarPatrimonioComObjetivos).
  const resultado = projetarPatrimonioComObjetivos({
    idadeAtual: idade,
    idadeAposentadoria,
    patrimonioInicial,
    aporteMensal: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    taxaAnualPct: rentabilidadeReal,
    objetivos,
  });
  const resultadoSemObjetivos = simularEvolucaoPatrimonio(
    idade,
    idadeAposentadoria,
    patrimonioInicial,
    capacidadeAtual,
    rendaDesejada,
    rentabilidadeReal,
    100,
  );
  const valorDaRecomendacao = compararCenariosAposentadoria({
    idadeAtual: idade,
    idadeAposentadoria,
    patrimonioInicial,
    aporteMensalAtual: 0,
    aporteMensalRecomendado: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    taxaAnualPct: rentabilidadeReal,
  });
  const stressTests = simularStressTestAposentadoria({
    idadeAtual: idade,
    idadeAposentadoria,
    expectativaVida,
    patrimonioInicial,
    aporteMensal: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    taxaAnualPct: rentabilidadeReal,
  });
  // A linha de comparação ("Sem objetivos") continua sem os descontos — é
  // justamente a diferença entre as duas que mostra o custo dos objetivos.
  const pontosDaCurva = pontosAteHorizonte(resultado.pontos, idadeMaxima);
  const pontosSemObjetivos = pontosAteHorizonte(
    resultadoSemObjetivos.pontos,
    idadeMaxima,
  );
  const { idadeDeficitPreAposentadoria, idadeEsgotamento, patrimonioNaAposentadoria } =
    resultado;
  const sustentavel =
    idadeDeficitPreAposentadoria == null &&
    (idadeEsgotamento == null || idadeEsgotamento >= expectativaVida);
  // Saldos reais da curva simulada — a tendência (subiu/caiu/estável) é lida
  // deles, e não de idadeEsgotamento: não zerar até o fim da simulação não
  // quer dizer que o principal tenha sido preservado.
  const ultimoPontoSimulado = resultado.pontos[resultado.pontos.length - 1];
  const explicacaoTendencia = explicarTendenciaPatrimonio({
    aporteMensal: aporte,
    saqueMensalAposentadoria: rendaDesejada,
    idadeEsgotamento,
    expectativaVida,
    saldoInicioAposentadoria: patrimonioNaAposentadoria,
    saldoFinalSimulacao: ultimoPontoSimulado?.saldo ?? patrimonioNaAposentadoria,
    idadeFinalSimulacao: Math.round(ultimoPontoSimulado?.idadeAnos ?? 100),
  });

  return {
    rentabilidadeReal,
    idadeAposentadoria: resultado.idadeAposentadoria,
    pontosDaCurva,
    pontosSemObjetivos,
    idadeDeficitPreAposentadoria,
    idadeEsgotamento,
    patrimonioNaAposentadoria,
    sustentavel,
    explicacaoTendencia,
    valorDaRecomendacao,
    stressTests,
    limiteAporte: Math.max(2500, Math.round(capacidadeAtual * 2)),
    limiteRenda: 1_000_000,
  };
}
