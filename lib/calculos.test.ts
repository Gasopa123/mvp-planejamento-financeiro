import { describe, expect, it } from "vitest";
import {
  aporteMensalNecessario,
  capacidadeInvestimento,
  computeAccumulation,
  computeDrawdown,
  projecaoMetaComInflacao,
  reservaEmergenciaIdeal,
  simularAcumulacaoMensal,
  simularEvolucaoPatrimonio,
  taxaAnualParaMensal,
  taxaPoupanca,
  taxaRealIpcaMais,
  taxaRealPercentualCdi,
  taxaRealPrefixada,
  updateIndicators,
} from "./calculos";

describe("computeAccumulation", () => {
  // Caso de teste do enunciado (aporte R$1.500/mês, patrimônio inicial
  // R$30.000, 26 anos, 4,75% a.a.) — mas com o valor REAL que a fórmula do
  // HTML de referência produz, não o R$1.220.000 citado no enunciado.
  //
  // Conferido: R$1.220.000 é a constante RETIREMENT_PATRIMONY hardcoded no
  // HTML (usada como meta/marketing e como saldo padrão do drawdown), não o
  // resultado de computeAccumulation(1500, 26, 30000, 4.75) — nem o cenário
  // mais otimista do próprio HTML (R$1.700/mês) chega lá. O valor real é
  // ≈ R$1.010.422.
  it("reproduz o valor do cenário de referência do HTML (aporte 1500, 26 anos, patrimônio 30000, 4,75% a.a.)", () => {
    const resultado = computeAccumulation(1500, 26, 30000, 4.75);

    expect(resultado).toBeGreaterThan(1_000_000);
    expect(resultado).toBeLessThan(1_020_000);
    expect(resultado).toBeCloseTo(1_010_422.12, 1);
  });

  it("usa os mesmos defaults do HTML de referência (26 anos, 30000, 4.75%) quando omitidos", () => {
    const comDefaults = computeAccumulation(1500);
    const explicito = computeAccumulation(1500, 26, 30000, 4.75);

    expect(comDefaults).toBe(explicito);
  });

  it("cresce com aportes maiores, na mesma ordem dos cenários do HTML (500 < 1000 < 1500 < 1700)", () => {
    const valores = [500, 1000, 1500, 1700].map((aporte) =>
      computeAccumulation(aporte, 26, 30000, 4.75),
    );

    expect(valores).toEqual([...valores].sort((a, b) => a - b));
  });
});

describe("computeDrawdown", () => {
  // Encadeando com o resultado real de computeAccumulation (não com a
  // constante R$1.220.000 do HTML): com renda desejada de R$8.000/mês e
  // 4,75% a.a., o patrimônio acumulado (≈R$1.010.422) se esgota aos 79
  // anos — antes dos 85 citados no enunciado. Isso é consequência direta
  // do valor de acumulação já não bater na meta original (ver teste acima),
  // não um bug no port: com o mesmo patrimônio de partida e a mesma taxa,
  // o HTML original chegaria à mesma idade de esgotamento.
  it("esgota o patrimônio antes dos 85 anos quando encadeado com o resultado real da accumulation", () => {
    const patrimonioAposentadoria = computeAccumulation(1500, 26, 30000, 4.75);
    const { pontos, idadeEsgotamento } = computeDrawdown(
      4.75,
      8000,
      patrimonioAposentadoria,
    );

    expect(idadeEsgotamento).toBe(79);
    expect(pontos[0]).toEqual({ idade: 65, saldo: patrimonioAposentadoria });
    expect(pontos[pontos.length - 1]).toEqual({ idade: 79, saldo: 0 });
  });

  it("nunca esgota (idadeEsgotamento null) quando o saque é pequeno perto do patrimônio", () => {
    const { idadeEsgotamento, pontos } = computeDrawdown(4.75, 1000, 1_220_000);

    expect(idadeEsgotamento).toBeNull();
    // 65 até 100 inclusive = 36 pontos, um por ano simulado.
    expect(pontos).toHaveLength(36);
    expect(pontos[pontos.length - 1].idade).toBe(100);
  });

  it("respeita idadeInicio e idadeMaxima customizados", () => {
    const { pontos } = computeDrawdown(4.75, 1000, 1_220_000, 60, 70);

    expect(pontos[0].idade).toBe(60);
    expect(pontos[pontos.length - 1].idade).toBeLessThanOrEqual(70);
  });
});

describe("updateIndicators", () => {
  it("converte rentabilidade real em taxa nominal e % do CDI (premissas padrão: IPCA 4%, CDI 14,15%)", () => {
    const { taxaNominalPrefixada, percentualDoCdi } = updateIndicators(
      4.75,
      4,
      14.15,
    );

    expect(taxaNominalPrefixada).toBeCloseTo(8.94, 2);
    expect(percentualDoCdi).toBeCloseTo(63.18, 1);
  });
});

describe("taxaRealIpcaMais / taxaRealPercentualCdi / taxaRealPrefixada", () => {
  it("IPCA+: o spread digitado já é a rentabilidade real (identidade)", () => {
    expect(taxaRealIpcaMais(4.75)).toBe(4.75);
    expect(taxaRealIpcaMais(0)).toBe(0);
  });

  it("% do CDI e Prefixado são o inverso exato de updateIndicators", () => {
    // updateIndicators parte de uma taxa real e devolve o % do CDI e a taxa
    // prefixada equivalentes; as novas funções fazem o caminho inverso —
    // portanto alimentar a saída de updateIndicators de volta nelas deve
    // devolver a taxa real original.
    const inflacaoProjetadaPct = 4;
    const cdiAtualPct = 14.15;
    const rentabilidadeRealPct = 4.75;

    const { taxaNominalPrefixada, percentualDoCdi } = updateIndicators(
      rentabilidadeRealPct,
      inflacaoProjetadaPct,
      cdiAtualPct,
    );

    expect(
      taxaRealPercentualCdi(percentualDoCdi, cdiAtualPct, inflacaoProjetadaPct),
    ).toBeCloseTo(rentabilidadeRealPct, 8);
    expect(
      taxaRealPrefixada(taxaNominalPrefixada, inflacaoProjetadaPct),
    ).toBeCloseTo(rentabilidadeRealPct, 8);
  });

  it("% do CDI: 100% do CDI com CDI igual à inflação dá rentabilidade real ≈ 0", () => {
    expect(taxaRealPercentualCdi(100, 4, 4)).toBeCloseTo(0, 8);
  });

  it("Prefixado: taxa prefixada igual à inflação dá rentabilidade real = 0", () => {
    expect(taxaRealPrefixada(4, 4)).toBeCloseTo(0, 8);
  });
});

describe("simularAcumulacaoMensal", () => {
  it("cresce mês a mês com aportes positivos e termina na idade de aposentadoria", () => {
    const pontos = simularAcumulacaoMensal(30, 31, 10000, 500, 5);

    expect(pontos).toHaveLength(13); // mês 0 (inicial) até mês 12
    expect(pontos[0]).toEqual({ idadeAnos: 30, saldo: 10000 });
    expect(pontos[pontos.length - 1].idadeAnos).toBeCloseTo(31, 8);
    for (let i = 1; i < pontos.length; i++) {
      expect(pontos[i].saldo).toBeGreaterThan(pontos[i - 1].saldo);
    }
  });

  it("não gera meses quando já está na idade de aposentadoria ou além", () => {
    const pontos = simularAcumulacaoMensal(70, 65, 50000, 500, 5);

    expect(pontos).toEqual([{ idadeAnos: 70, saldo: 50000 }]);
  });
});

describe("simularEvolucaoPatrimonio", () => {
  it("liga acumulação e drawdown num único traçado contínuo, sem duplicar o ponto de virada", () => {
    const resultado = simularEvolucaoPatrimonio(60, 65, 100000, 1000, 3000, 4.75, 100);

    expect(resultado.idadeAposentadoria).toBe(65);
    expect(resultado.pontos[0]).toEqual({
      idadeAnos: 60,
      saldo: 100000,
      fase: "acumulacao",
    });

    const pontoVirada = resultado.pontos.find(
      (p) => p.fase === "acumulacao" && p.idadeAnos === 65,
    );
    expect(pontoVirada?.saldo).toBeCloseTo(resultado.patrimonioNaAposentadoria, 6);

    // não duplica o ponto de virada: só uma ocorrência da idade 65 no total.
    const ocorrenciasAos65 = resultado.pontos.filter((p) => p.idadeAnos === 65);
    expect(ocorrenciasAos65).toHaveLength(1);

    const fases = resultado.pontos.map((p) => p.fase);
    expect(fases).toContain("acumulacao");
    expect(fases).toContain("drawdown");
    expect(resultado.pontos[resultado.pontos.length - 1].fase).toBe("drawdown");
  });

  it("consistente com computeDrawdown encadeado manualmente", () => {
    const resultado = simularEvolucaoPatrimonio(60, 65, 100000, 1000, 8000, 4.75, 100);

    const acumulacao = simularAcumulacaoMensal(60, 65, 100000, 1000, 4.75);
    const patrimonioNaAposentadoria = acumulacao[acumulacao.length - 1].saldo;
    const { idadeEsgotamento } = computeDrawdown(
      4.75,
      8000,
      patrimonioNaAposentadoria,
      65,
      100,
    );

    expect(resultado.patrimonioNaAposentadoria).toBeCloseTo(patrimonioNaAposentadoria, 6);
    expect(resultado.idadeEsgotamento).toBe(idadeEsgotamento);
  });

  it("marca o esgotamento com saldo zero quando o saque é alto demais", () => {
    const resultado = simularEvolucaoPatrimonio(60, 61, 50000, 0, 10000, 2, 100);

    expect(resultado.idadeEsgotamento).not.toBeNull();
    const ultimoPonto = resultado.pontos[resultado.pontos.length - 1];
    expect(ultimoPonto.saldo).toBe(0);
    expect(ultimoPonto.idadeAnos).toBe(resultado.idadeEsgotamento);
  });
});

describe("capacidadeInvestimento / taxaPoupanca / reservaEmergenciaIdeal", () => {
  it("calcula capacidade de investimento e taxa de poupança", () => {
    expect(capacidadeInvestimento(10000, 6000)).toBe(4000);
    expect(taxaPoupanca(10000, 6000)).toBeCloseTo(0.4, 10);
  });

  it("calcula a reserva de emergência ideal como 6x a despesa mensal", () => {
    expect(reservaEmergenciaIdeal(6000)).toBe(36000);
  });
});

describe("projecaoMetaComInflacao", () => {
  it("projeta o valor futuro de uma meta pela inflação anual", () => {
    const resultado = projecaoMetaComInflacao(100000, 4, 10);

    expect(resultado).toBeCloseTo(100000 * Math.pow(1.04, 10), 6);
  });
});

describe("aporteMensalNecessario", () => {
  it("recupera o aporte original a partir da meta futura equivalente (round-trip)", () => {
    const taxaAnualPct = 6;
    const prazoMeses = 120;
    const patrimonioAtual = 5000;
    const aporteEsperado = 1000;

    const i = taxaAnualParaMensal(taxaAnualPct);
    const metaFutura =
      aporteEsperado * ((Math.pow(1 + i, prazoMeses) - 1) / i) +
      patrimonioAtual * Math.pow(1 + i, prazoMeses);

    const aporteCalculado = aporteMensalNecessario(
      metaFutura,
      patrimonioAtual,
      taxaAnualPct,
      prazoMeses,
    );

    expect(aporteCalculado).toBeCloseTo(aporteEsperado, 6);
  });

  it("não exige aporte (<=0) quando o patrimônio atual já capitalizado supera a meta", () => {
    const resultado = aporteMensalNecessario(100000, 200000, 5, 60);

    expect(resultado).toBeLessThanOrEqual(0);
  });
});
