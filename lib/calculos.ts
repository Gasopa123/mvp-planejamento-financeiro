// Motor de cálculo financeiro do MVP.
//
// Portado de reference/Planejamento-Priscila.html (funções computeAccumulation,
// computeDrawdown e updateIndicators, originalmente em JS solto no HTML) para
// funções TypeScript puras — mesmo comportamento matemático, mesma conversão
// de taxa anual pra mensal e mesmo método de drawdown ano a ano do original.
//
// Fórmulas conforme CLAUDE.md § "Motor de cálculo financeiro".

import { formatarMoeda } from "./format";

/**
 * Converte uma taxa anual (%) na taxa mensal equivalente (fração), pelo
 * regime de juros compostos: i_mensal = (1 + taxa_anual)^(1/12) - 1.
 */
export function taxaAnualParaMensal(taxaAnualPct: number): number {
  const taxaAnual = taxaAnualPct / 100;
  return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

/** capacidade_investimento = renda_mensal - despesa_mensal */
export function capacidadeInvestimento(
  rendaMensal: number,
  despesaMensal: number,
): number {
  return rendaMensal - despesaMensal;
}

/** taxa_poupanca = capacidade_investimento / renda_mensal */
export function taxaPoupanca(
  rendaMensal: number,
  despesaMensal: number,
): number {
  return capacidadeInvestimento(rendaMensal, despesaMensal) / rendaMensal;
}

/** reserva_emergencia_ideal = despesa_mensal × 4 (ajuste pedido pelo assessor) */
export function reservaEmergenciaIdeal(despesaMensal: number): number {
  return despesaMensal * 4;
}

/**
 * Valor futuro acumulado até a aposentadoria: valor futuro de uma anuidade
 * de aportes mensais (compostos mensalmente) somado ao patrimônio atual
 * capitalizado (composto anualmente pelo número de anos do horizonte).
 *
 *   i_mensal      = (1 + taxa_anual)^(1/12) - 1
 *   FV_aportes    = aporte_mensal × [((1+i)^n - 1) / i] × (1+i)
 *   FV_patrimonio = patrimonio_atual × (1 + taxa_anual)^anos
 *
 * @param aporteMensal        aporte mensal constante
 * @param anos                horizonte até a aposentadoria, em anos (padrão 26, igual ao HTML de referência)
 * @param patrimonioAtual     patrimônio já investido hoje (padrão 30000, igual ao HTML de referência)
 * @param taxaAnualPct         rentabilidade real anual assumida, em % (padrão 4.75, igual ao HTML de referência)
 */
export function computeAccumulation(
  aporteMensal: number,
  anos: number = 26,
  patrimonioAtual: number = 30000,
  taxaAnualPct: number = 4.75,
): number {
  const taxaAnual = taxaAnualPct / 100;
  const i = taxaAnualParaMensal(taxaAnualPct);
  const n = anos * 12;

  const fvAportes = aporteMensal * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const fvPatrimonioAtual = patrimonioAtual * Math.pow(1 + taxaAnual, anos);

  return fvAportes + fvPatrimonioAtual;
}

export type PontoDrawdown = {
  idade: number;
  saldo: number;
};

export type ResultadoDrawdown = {
  pontos: PontoDrawdown[];
  /** Idade em que o patrimônio se esgota (saldo <= 0), ou null se nunca se esgota até idadeMaxima. */
  idadeEsgotamento: number | null;
};

/**
 * Simulação de sustentabilidade (drawdown) ano a ano, da aposentadoria até
 * a idade máxima simulada: saldo = (saldo - saque_anual) × (1 + taxa_anual).
 * Se o saldo chegar a <= 0, o patrimônio se esgota nesse ano e a simulação para.
 *
 * @param taxaAnualPct              rentabilidade real anual assumida, em %
 * @param saqueMensal               retirada mensal desejada na aposentadoria
 * @param patrimonioAposentadoria   saldo acumulado ao se aposentar (ponto de partida do drawdown)
 * @param idadeInicio               idade de início da aposentadoria (padrão 65, igual ao HTML de referência)
 * @param idadeMaxima               idade máxima simulada (padrão 100, igual ao HTML de referência)
 */
export function computeDrawdown(
  taxaAnualPct: number,
  saqueMensal: number,
  patrimonioAposentadoria: number,
  idadeInicio: number = 65,
  idadeMaxima: number = 100,
): ResultadoDrawdown {
  const taxaAnual = taxaAnualPct / 100;
  const saqueAnual = saqueMensal * 12;

  let saldo = patrimonioAposentadoria;
  const pontos: PontoDrawdown[] = [{ idade: idadeInicio, saldo }];
  let idadeEsgotamento: number | null = null;

  for (let idade = idadeInicio + 1; idade <= idadeMaxima; idade++) {
    saldo = (saldo - saqueAnual) * (1 + taxaAnual);
    if (saldo <= 0) {
      saldo = 0;
      pontos.push({ idade, saldo });
      idadeEsgotamento = idade;
      break;
    }
    pontos.push({ idade, saldo });
  }

  return { pontos, idadeEsgotamento };
}

/**
 * Projeção de meta com inflação: valor_futuro = valor_hoje × (1 + inflacao)^anos
 */
export function projecaoMetaComInflacao(
  valorHoje: number,
  inflacaoAnualPct: number,
  anos: number,
): number {
  return valorHoje * Math.pow(1 + inflacaoAnualPct / 100, anos);
}

/**
 * Aporte mensal necessário pra atingir uma meta futura, isolando o aporte
 * na fórmula de valor futuro de anuidade:
 *
 *   aporte = (meta_futura - patrimonio_atual×(1+i)^n) × i / [(1+i)^n - 1]
 *
 * @param metaFutura        valor da meta já projetado no futuro (ex: saída de projecaoMetaComInflacao)
 * @param patrimonioAtual   patrimônio já investido hoje, destinado a essa meta
 * @param taxaAnualPct       rentabilidade real anual assumida, em %
 * @param prazoMeses        prazo até a meta, em meses
 */
export function aporteMensalNecessario(
  metaFutura: number,
  patrimonioAtual: number,
  taxaAnualPct: number,
  prazoMeses: number,
): number {
  const i = taxaAnualParaMensal(taxaAnualPct);
  const n = prazoMeses;

  const fvPatrimonioAtual = patrimonioAtual * Math.pow(1 + i, n);
  return ((metaFutura - fvPatrimonioAtual) * i) / (Math.pow(1 + i, n) - 1);
}

/**
 * Rentabilidade real de um produto "IPCA+X%": o spread digitado já É a
 * rentabilidade real anual, por definição do produto — não há conversão.
 */
export function taxaRealIpcaMais(spreadPct: number): number {
  return spreadPct;
}

/**
 * Rentabilidade real anual de um produto indexado a "X% do CDI":
 *
 *   taxa_nominal = percentual_cdi × cdi_atual
 *   taxa_real    = (1 + taxa_nominal) / (1 + inflacao_projetada) - 1
 *
 * (inverso de updateIndicators: lá se parte da taxa real e chega no % do
 * CDI equivalente; aqui parte-se do % do CDI e chega-se na taxa real.)
 */
export function taxaRealPercentualCdi(
  percentualCdiPct: number,
  cdiAtualPct: number,
  inflacaoProjetadaPct: number,
): number {
  const taxaNominal = (percentualCdiPct / 100) * (cdiAtualPct / 100);
  const taxaReal = (1 + taxaNominal) / (1 + inflacaoProjetadaPct / 100) - 1;
  return taxaReal * 100;
}

/**
 * Rentabilidade real anual de um produto prefixado a uma taxa nominal fixa:
 *
 *   taxa_real = (1 + taxa_prefixada) / (1 + inflacao_projetada) - 1
 *
 * (inverso de updateIndicators: lá taxa_nominal_prefixada = (1+real)×(1+inflacao)-1.)
 */
export function taxaRealPrefixada(
  taxaPrefixadaPct: number,
  inflacaoProjetadaPct: number,
): number {
  const taxaReal =
    (1 + taxaPrefixadaPct / 100) / (1 + inflacaoProjetadaPct / 100) - 1;
  return taxaReal * 100;
}

export type ImpactoObjetivoInput = {
  valor_estimado: number | null;
  horizonte_anos: number | null;
};

/**
 * Valor mensal sugerido pra guardar até alcançar um objetivo: projeta o
 * valor de hoje pela inflação até o horizonte do objetivo e divide o valor
 * futuro pelo número de meses até lá — divisão linear simples, sem contar
 * rendimento sobre o que for guardado.
 *
 * Retorna null quando o objetivo não tem prazo (horizonte nulo ou <= 0):
 * sem prazo não existe aporte mensal a sugerir, e qualquer piso artificial
 * (ex.: 1 mês) transformaria uma meta de R$ 100 mil numa sugestão de
 * "guardar R$ 100 mil por mês". Cabe a quem chama tratar o null — ver
 * ObjetivosTab, que pede o prazo, e impactoObjetivos, que soma como zero.
 */
export function valorMensalSugeridoObjetivo(
  objetivo: ImpactoObjetivoInput,
  inflacaoProjetadaPct: number,
): number | null {
  const horizonteAnos = objetivo.horizonte_anos;
  if (horizonteAnos == null || horizonteAnos <= 0) return null;

  return (
    projecaoMetaComInflacao(
      objetivo.valor_estimado ?? 0,
      inflacaoProjetadaPct,
      horizonteAnos,
    ) /
    (horizonteAnos * 12)
  );
}

export function impactoObjetivos(
  objetivos: ImpactoObjetivoInput[],
  capacidadeMensal: number,
  patrimonioInvestido: number,
  inflacaoProjetadaPct: number,
) {
  const totalObjetivos = objetivos.reduce(
    (total, objetivo) =>
      total +
      projecaoMetaComInflacao(
        objetivo.valor_estimado ?? 0,
        inflacaoProjetadaPct,
        objetivo.horizonte_anos ?? 0,
      ),
    0,
  );
  // Objetivo sem prazo não entra no aporte mensal (valorMensalSugeridoObjetivo
  // devolve null): ele ainda conta no total futuro, mas não há como distribuir
  // um valor por mês sem saber até quando.
  const aporteMensalObjetivos = objetivos.reduce(
    (total, objetivo) =>
      total + (valorMensalSugeridoObjetivo(objetivo, inflacaoProjetadaPct) ?? 0),
    0,
  );

  return {
    totalObjetivos,
    aporteMensalObjetivos,
    capacidadeRestante: capacidadeMensal - aporteMensalObjetivos,
    patrimonioDepoisObjetivos: patrimonioInvestido - totalObjetivos,
  };
}

export type ComparacaoCenariosAposentadoriaInput = {
  idadeAtual: number;
  idadeAposentadoria: number;
  patrimonioInicial: number;
  aporteMensalAtual: number;
  aporteMensalRecomendado: number;
  saqueMensalAposentadoria: number;
  taxaAnualPct: number;
};

export function compararCenariosAposentadoria({
  idadeAtual,
  idadeAposentadoria,
  patrimonioInicial,
  aporteMensalAtual,
  aporteMensalRecomendado,
  saqueMensalAposentadoria,
  taxaAnualPct,
}: ComparacaoCenariosAposentadoriaInput) {
  const atual = simularEvolucaoPatrimonio(
    idadeAtual,
    idadeAposentadoria,
    patrimonioInicial,
    aporteMensalAtual,
    saqueMensalAposentadoria,
    taxaAnualPct,
  ).patrimonioNaAposentadoria;
  const recomendado = simularEvolucaoPatrimonio(
    idadeAtual,
    idadeAposentadoria,
    patrimonioInicial,
    aporteMensalRecomendado,
    saqueMensalAposentadoria,
    taxaAnualPct,
  ).patrimonioNaAposentadoria;

  return {
    atual,
    recomendado,
    valorCriado: recomendado - atual,
    aporteMensalAdicional: aporteMensalRecomendado - aporteMensalAtual,
  };
}

export type StressTestAposentadoriaInput = {
  idadeAtual: number;
  idadeAposentadoria: number;
  expectativaVida: number;
  patrimonioInicial: number;
  aporteMensal: number;
  saqueMensalAposentadoria: number;
  taxaAnualPct: number;
};

export function simularStressTestAposentadoria(input: StressTestAposentadoriaInput) {
  const cenarios = [
    { nome: "Base", taxa: input.taxaAnualPct, aporte: input.aporteMensal, idadeReferencia: input.expectativaVida },
    { nome: "Inflação +2%", taxa: input.taxaAnualPct - 2, aporte: input.aporteMensal, idadeReferencia: input.expectativaVida },
    { nome: "Rentabilidade -2%", taxa: input.taxaAnualPct - 2, aporte: input.aporteMensal, idadeReferencia: input.expectativaVida },
    { nome: "Aporte -30%", taxa: input.taxaAnualPct, aporte: input.aporteMensal * 0.7, idadeReferencia: input.expectativaVida },
    { nome: "Viver +5 anos", taxa: input.taxaAnualPct, aporte: input.aporteMensal, idadeReferencia: input.expectativaVida + 5 },
  ];

  return cenarios.map((cenario) => {
    const resultado = simularEvolucaoPatrimonio(
      input.idadeAtual,
      input.idadeAposentadoria,
      input.patrimonioInicial,
      cenario.aporte,
      input.saqueMensalAposentadoria,
      cenario.taxa,
      Math.max(100, cenario.idadeReferencia),
    );
    return {
      nome: cenario.nome,
      patrimonioNaAposentadoria: resultado.patrimonioNaAposentadoria,
      idadeEsgotamento: resultado.idadeEsgotamento,
      idadeReferencia: cenario.idadeReferencia,
    };
  });
}

export type PontoAcumulacaoMensal = {
  /** Idade fracionária (idade atual + mês/12) — permite plotar mês a mês. */
  idadeAnos: number;
  saldo: number;
};

/**
 * Acumulação mês a mês (não só o valor final, como computeAccumulation):
 * a cada mês o aporte entra e o saldo inteiro (existente + aportes já
 * feitos) rende à taxa mensal equivalente — mesmo regime de anuidade-devida
 * de computeAccumulation (aporte no início do mês, já rendendo no mesmo mês),
 * só que aplicado uniformemente ao saldo corrente em vez de separar
 * patrimônio existente (composto ao ano) dos aportes (composto ao mês).
 *
 *   i_mensal = (1 + taxa_anual)^(1/12) - 1
 *   saldo_mes = (saldo_mes_anterior + aporte_mensal) × (1 + i_mensal)
 */
export function simularAcumulacaoMensal(
  idadeAtual: number,
  idadeAposentadoria: number,
  patrimonioInicial: number,
  aporteMensal: number,
  taxaAnualPct: number,
): PontoAcumulacaoMensal[] {
  const idadeAlvo = Math.max(idadeAtual, idadeAposentadoria);
  const i = taxaAnualParaMensal(taxaAnualPct);
  const meses = Math.round((idadeAlvo - idadeAtual) * 12);

  const pontos: PontoAcumulacaoMensal[] = [
    { idadeAnos: idadeAtual, saldo: patrimonioInicial },
  ];
  let saldo = patrimonioInicial;

  for (let mes = 1; mes <= meses; mes++) {
    saldo = (saldo + aporteMensal) * (1 + i);
    pontos.push({ idadeAnos: idadeAtual + mes / 12, saldo });
  }

  return pontos;
}

export type PontoEvolucaoPatrimonio = {
  idadeAnos: number;
  saldo: number;
  fase: "acumulacao" | "drawdown";
};

export type ResultadoEvolucaoPatrimonio = {
  pontos: PontoEvolucaoPatrimonio[];
  /** Idade (clampada a >= idadeAtual) em que a fase de drawdown começa. */
  idadeAposentadoria: number;
  /** Saldo no início da aposentadoria — ponto de virada entre as duas fases. */
  patrimonioNaAposentadoria: number;
  idadeEsgotamento: number | null;
};

/**
 * Trajetória única e contínua do patrimônio, da idade atual até idadeMaxima:
 * acumulação mês a mês (simularAcumulacaoMensal) até a aposentadoria, e a
 * partir daí drawdown ano a ano (computeDrawdown) até idadeMaxima ou até
 * zerar — o que vier primeiro.
 */
export function simularEvolucaoPatrimonio(
  idadeAtual: number,
  idadeAposentadoria: number,
  patrimonioInicial: number,
  aporteMensal: number,
  saqueMensalAposentadoria: number,
  taxaAnualPct: number,
  idadeMaxima: number = 100,
): ResultadoEvolucaoPatrimonio {
  const idadeAlvo = Math.max(idadeAtual, idadeAposentadoria);

  const acumulacao = simularAcumulacaoMensal(
    idadeAtual,
    idadeAlvo,
    patrimonioInicial,
    aporteMensal,
    taxaAnualPct,
  );
  const patrimonioNaAposentadoria =
    acumulacao[acumulacao.length - 1]?.saldo ?? patrimonioInicial;

  const { pontos: pontosDrawdown, idadeEsgotamento } = computeDrawdown(
    taxaAnualPct,
    saqueMensalAposentadoria,
    patrimonioNaAposentadoria,
    idadeAlvo,
    Math.max(idadeAlvo, idadeMaxima),
  );

  const pontos: PontoEvolucaoPatrimonio[] = [
    ...acumulacao.map((p) => ({ ...p, fase: "acumulacao" as const })),
    // pontosDrawdown[0] repete a idade/saldo do último ponto de acumulação
    // (é o mesmo ponto de virada) — pulado aqui pra não duplicar no traçado.
    ...pontosDrawdown
      .slice(1)
      .map((p) => ({ idadeAnos: p.idade, saldo: p.saldo, fase: "drawdown" as const })),
  ];

  return {
    pontos,
    idadeAposentadoria: idadeAlvo,
    patrimonioNaAposentadoria,
    idadeEsgotamento,
  };
}

export type ExplicacaoTendenciaPatrimonioInput = {
  /** Aporte mensal atual (capacidade de investimento) na fase de acumulação. */
  aporteMensal: number;
  /** Retirada mensal desejada na aposentadoria. */
  saqueMensalAposentadoria: number;
  /**
   * Idade em que o saldo chega a zero no drawdown, ou null se ele não zera
   * até o fim da simulação. Atenção: null NÃO significa que o principal foi
   * preservado — o saldo pode ter caído bastante sem chegar a zero, por isso
   * a tendência é lida dos saldos reais da curva, não desse campo.
   */
  idadeEsgotamento: number | null;
  expectativaVida: number;
  /** Saldo no início da aposentadoria — ponto de virada entre acumulação e drawdown. */
  saldoInicioAposentadoria: number;
  /** Saldo no último ponto simulado da curva. */
  saldoFinalSimulacao: number;
  /** Idade do último ponto simulado da curva. */
  idadeFinalSimulacao: number;
};

/** Variação relativa tolerada pra considerar o saldo "praticamente estável". */
const TOLERANCIA_SALDO_ESTAVEL = 0.01;

/**
 * Explicação em linguagem simples do motivo da curva de patrimônio subir ou
 * cair, lida dos saldos reais simulados: na acumulação sobe por aportes +
 * rendimento; na aposentadoria compara o saldo do início com o do último
 * ponto simulado pra dizer se caiu, subiu ou ficou estável. Texto sempre em
 * tom de projeção ("nesta simulação", "com as premissas informadas"), porque
 * é cenário projetado, não garantia.
 */
export function explicarTendenciaPatrimonio(
  input: ExplicacaoTendenciaPatrimonioInput,
): string {
  const acumulacao =
    input.aporteMensal > 0
      ? "Na fase de acumulação a curva sobe por aportes mensais somados ao rendimento."
      : "Sem capacidade de investimento hoje (aportes insuficientes), na acumulação a curva só cresce pelo rendimento do que já está investido.";

  const saque = formatarMoeda(input.saqueMensalAposentadoria);

  if (input.idadeEsgotamento != null) {
    const antesDaExpectativa = input.idadeEsgotamento < input.expectativaVida;
    return `${acumulacao} Na aposentadoria ela cai porque a retirada mensal de ${saque} supera o rendimento gerado: nesta simulação o saldo é consumido até zerar aos ${input.idadeEsgotamento} anos${
      antesDaExpectativa
        ? `, antes da expectativa de vida de ${input.expectativaVida} anos`
        : ""
    }.`;
  }

  const inicio = formatarMoeda(input.saldoInicioAposentadoria);
  const fim = formatarMoeda(input.saldoFinalSimulacao);
  const variacao = input.saldoFinalSimulacao - input.saldoInicioAposentadoria;
  const limiteEstavel =
    Math.abs(input.saldoInicioAposentadoria) * TOLERANCIA_SALDO_ESTAVEL;

  if (variacao < -limiteEstavel) {
    return `${acumulacao} Na aposentadoria ela cai: a retirada mensal de ${saque} supera o rendimento gerado, então parte do principal vai sendo consumida — nesta simulação o saldo vai de ${inicio} para ${fim} aos ${input.idadeFinalSimulacao} anos. Não chega a zerar dentro do período simulado, mas segue em queda.`;
  }

  if (variacao > limiteEstavel) {
    return `${acumulacao} Na aposentadoria ela continua subindo: com as premissas informadas o rendimento supera a retirada mensal de ${saque}, e nesta simulação o saldo vai de ${inicio} para ${fim} aos ${input.idadeFinalSimulacao} anos.`;
  }

  return `${acumulacao} Na aposentadoria ela fica praticamente estável: com as premissas informadas o rendimento cobre quase exatamente a retirada mensal de ${saque}, mantendo o saldo perto de ${inicio} até os ${input.idadeFinalSimulacao} anos.`;
}

export type IndicadoresMercado = {
  /** taxa_nominal_prefixada, em % a.a. */
  taxaNominalPrefixada: number;
  /** percentual_do_cdi, em % */
  percentualDoCdi: number;
};

/**
 * Conversão da rentabilidade real assumida em indicadores de mercado:
 *
 *   taxa_nominal_prefixada = (1 + rentabilidade_real) × (1 + inflacao_projetada) - 1
 *   percentual_do_cdi      = taxa_nominal_prefixada / cdi_atual
 *
 * @param rentabilidadeRealPct    rentabilidade real anual assumida, em %
 * @param inflacaoProjetadaPct    inflação projetada, em % (assumptions.inflacao_projetada)
 * @param cdiAtualPct             CDI atual de referência, em % (assumptions.cdi_atual)
 */
export function updateIndicators(
  rentabilidadeRealPct: number,
  inflacaoProjetadaPct: number,
  cdiAtualPct: number,
): IndicadoresMercado {
  const taxaNominalPrefixada =
    ((1 + rentabilidadeRealPct / 100) * (1 + inflacaoProjetadaPct / 100) - 1) *
    100;
  const percentualDoCdi = (taxaNominalPrefixada / cdiAtualPct) * 100;

  return { taxaNominalPrefixada, percentualDoCdi };
}
