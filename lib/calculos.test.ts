import { describe, expect, it } from "vitest";
import {
  aplicarObjetivosNaCurva,
  aporteMensalNecessario,
  capacidadeInvestimento,
  computeAccumulation,
  computeDrawdown,
  impactoObjetivos,
  valorMensalSugeridoObjetivo,
  explicarTendenciaPatrimonio,
  compararCenariosAposentadoria,
  simularStressTestAposentadoria,
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

describe("impactoObjetivos", () => {
  // O objetivo sem prazo (horizonte 0) continua contando no total futuro,
  // mas não entra no aporte mensal — antes ele entrava inteiro, o que fazia
  // R$ 6.000 sem prazo virar R$ 6.000/mês no agregado.
  it("calcula aporte mensal, capacidade restante e patrimônio após objetivos", () => {
    expect(
      impactoObjetivos(
        [
          { valor_estimado: 12000, horizonte_anos: 1 },
          { valor_estimado: 6000, horizonte_anos: 0 },
        ],
        5000,
        40000,
        0,
      ),
    ).toEqual({
      totalObjetivos: 18000,
      aporteMensalObjetivos: 1000,
      capacidadeRestante: 4000,
      patrimonioDepoisObjetivos: 22000,
    });
  });

  it("não infla o aporte mensal com objetivos sem prazo", () => {
    const impacto = impactoObjetivos(
      [{ valor_estimado: 100000, horizonte_anos: null }],
      5000,
      40000,
      0,
    );

    expect(impacto.aporteMensalObjetivos).toBe(0);
    expect(impacto.totalObjetivos).toBe(100000);
    expect(impacto.capacidadeRestante).toBe(5000);
  });
});

describe("compararCenariosAposentadoria", () => {
  it("mostra em reais o valor criado pelo aporte recomendado", () => {
    const resultado = compararCenariosAposentadoria({
      idadeAtual: 40,
      idadeAposentadoria: 65,
      patrimonioInicial: 100000,
      aporteMensalAtual: 0,
      aporteMensalRecomendado: 2000,
      saqueMensalAposentadoria: 8000,
      taxaAnualPct: 5,
    });

    expect(resultado.recomendado).toBeGreaterThan(resultado.atual);
    expect(resultado.valorCriado).toBeCloseTo(resultado.recomendado - resultado.atual, 6);
    expect(resultado.aporteMensalAdicional).toBe(2000);
  });
});

describe("simularStressTestAposentadoria", () => {
  it("gera choques fixos de inflação, retorno, aporte e longevidade", () => {
    const cenarios = simularStressTestAposentadoria({
      idadeAtual: 40,
      idadeAposentadoria: 65,
      expectativaVida: 90,
      patrimonioInicial: 100000,
      aporteMensal: 2000,
      saqueMensalAposentadoria: 8000,
      taxaAnualPct: 5,
    });

    expect(cenarios.map((c) => c.nome)).toEqual([
      "Base",
      "Inflação +2%",
      "Rentabilidade -2%",
      "Aporte -30%",
      "Viver +5 anos",
    ]);
    expect(cenarios[3].patrimonioNaAposentadoria).toBeLessThan(cenarios[0].patrimonioNaAposentadoria);
    expect(cenarios[4].idadeReferencia).toBe(95);
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

  it("calcula a reserva de emergência ideal como 4x a despesa mensal", () => {
    expect(reservaEmergenciaIdeal(6000)).toBe(24000);
  });
});

describe("projecaoMetaComInflacao", () => {
  it("projeta o valor futuro de uma meta pela inflação anual", () => {
    const resultado = projecaoMetaComInflacao(100000, 4, 10);

    expect(resultado).toBeCloseTo(100000 * Math.pow(1.04, 10), 6);
  });
});

describe("aplicarObjetivosNaCurva", () => {
  // Curva plana e taxa 0 deixam o efeito do objetivo isolado: qualquer
  // diferença vem só do desconto, não do rendimento.
  function curvaPlana(
    idadeInicial: number,
    anos: number,
    saldo: number,
    fase: "acumulacao" | "drawdown" = "acumulacao",
  ) {
    return Array.from({ length: anos + 1 }, (_, i) => ({
      idadeAnos: idadeInicial + i,
      saldo,
      fase,
    }));
  }

  it("desconta o objetivo no ano do horizonte e mantém o saldo menor daí em diante", () => {
    const pontos = curvaPlana(30, 4, 100000);

    const { pontos: ajustados } = aplicarObjetivosNaCurva(
      pontos,
      [{ valor_estimado: 30000, horizonte_anos: 2 }],
      0,
    );

    // Antes do horizonte, nada muda.
    expect(ajustados[0].saldo).toBe(100000);
    expect(ajustados[1].saldo).toBe(100000);
    // No ano do objetivo, cai R$ 30.000.
    expect(ajustados[2].saldo).toBe(70000);
    // Os anos seguintes continuam a partir do saldo já reduzido.
    expect(ajustados[3].saldo).toBe(70000);
    expect(ajustados[4].saldo).toBe(70000);
  });

  it("acumula vários objetivos, cada um no seu ano", () => {
    const pontos = curvaPlana(30, 5, 100000);

    const { pontos: ajustados } = aplicarObjetivosNaCurva(
      pontos,
      [
        { valor_estimado: 30000, horizonte_anos: 2 },
        { valor_estimado: 10000, horizonte_anos: 4 },
      ],
      0,
    );

    expect(ajustados[1].saldo).toBe(100000);
    expect(ajustados[2].saldo).toBe(70000);
    expect(ajustados[3].saldo).toBe(70000);
    expect(ajustados[4].saldo).toBe(60000);
    expect(ajustados[5].saldo).toBe(60000);
  });

  it("não altera a curva quando o objetivo não tem horizonte", () => {
    const pontos = curvaPlana(30, 3, 100000);

    const { pontos: ajustados, idadeEsgotamento } = aplicarObjetivosNaCurva(
      pontos,
      [{ valor_estimado: 30000, horizonte_anos: null }],
      0,
    );

    expect(ajustados).toEqual(pontos);
    expect(idadeEsgotamento).toBeNull();
  });

  it("não altera a curva quando o objetivo não tem valor estimado", () => {
    const pontos = curvaPlana(30, 3, 100000);

    const { pontos: ajustados } = aplicarObjetivosNaCurva(
      pontos,
      [{ valor_estimado: null, horizonte_anos: 2 }],
      0,
    );

    expect(ajustados).toEqual(pontos);
  });

  it("ignora objetivo com valor zero ou negativo", () => {
    const pontos = curvaPlana(30, 3, 100000);

    expect(
      aplicarObjetivosNaCurva(pontos, [{ valor_estimado: 0, horizonte_anos: 1 }], 0)
        .pontos,
    ).toEqual(pontos);
    expect(
      aplicarObjetivosNaCurva(pontos, [{ valor_estimado: -500, horizonte_anos: 1 }], 0)
        .pontos,
    ).toEqual(pontos);
  });

  it("capitaliza o desconto: o dinheiro retirado deixa de render dali em diante", () => {
    const pontos = curvaPlana(30, 2, 100000);

    const { pontos: ajustados } = aplicarObjetivosNaCurva(
      pontos,
      [{ valor_estimado: 10000, horizonte_anos: 1 }],
      10,
    );

    expect(ajustados[1].saldo).toBe(90000);
    // Um ano depois o buraco de 10.000 já "renderia" 10% — vira 11.000.
    expect(ajustados[2].saldo).toBeCloseTo(89000, 6);
  });

  // Regressão do bug reportado: cliente de 26 anos, sem nada investido ainda,
  // aporte de R$ 2.500/mês e patrimônio projetado em milhões. O primeiro
  // ponto da curva vale 0 (fase de acumulação) e satisfazia saldo <= 0, então
  // a tela dizia "Patrimônio se esgota aos 26 anos" — a idade ATUAL, não uma
  // idade de esgotamento real.
  it("não marca esgotamento na idade atual quando o cliente começa sem patrimônio investido", () => {
    const resultado = simularEvolucaoPatrimonio(26, 65, 0, 2500, 12000, 4.75, 100);

    const { idadeEsgotamento } = aplicarObjetivosNaCurva(
      resultado.pontos,
      [{ valor_estimado: 30000, horizonte_anos: 5 }],
      4.75,
    );

    expect(resultado.pontos[0]).toMatchObject({ idadeAnos: 26, saldo: 0 });
    expect(resultado.patrimonioNaAposentadoria).toBeGreaterThan(3_000_000);
    expect(idadeEsgotamento).not.toBe(26);
    // Sem objetivos a curva não esgotava; um objetivo de R$ 30 mil aos 5 anos
    // não pode passar a esgotá-la.
    expect(resultado.idadeEsgotamento).toBeNull();
    expect(idadeEsgotamento).toBeNull();
  });

  it("nunca devolve idade de esgotamento anterior à aposentadoria", () => {
    // Objetivo enorme durante a acumulação derruba o saldo, mas isso não é
    // "esgotamento de aposentadoria" — só passa a contar depois dela.
    const resultado = simularEvolucaoPatrimonio(30, 60, 50000, 500, 20000, 4.75, 100);

    const { idadeEsgotamento } = aplicarObjetivosNaCurva(
      resultado.pontos,
      [{ valor_estimado: 5_000_000, horizonte_anos: 2 }],
      4.75,
    );

    expect(idadeEsgotamento).not.toBeNull();
    expect(idadeEsgotamento as number).toBeGreaterThanOrEqual(
      resultado.idadeAposentadoria,
    );
  });

  it("aponta a idade em que o saldo zera por causa dos objetivos, na aposentadoria", () => {
    const pontos = curvaPlana(30, 3, 20000, "drawdown");

    const { idadeEsgotamento } = aplicarObjetivosNaCurva(
      pontos,
      [{ valor_estimado: 25000, horizonte_anos: 2 }],
      0,
    );

    expect(idadeEsgotamento).toBe(32);
  });

  it("não chama de esgotamento um saldo zerado ainda na acumulação", () => {
    const pontos = curvaPlana(30, 3, 20000, "acumulacao");

    const { idadeEsgotamento, pontos: ajustados } = aplicarObjetivosNaCurva(
      pontos,
      [{ valor_estimado: 25000, horizonte_anos: 2 }],
      0,
    );

    // O desconto continua aparecendo na curva...
    expect(ajustados[2].saldo).toBe(-5000);
    // ...mas não vira "patrimônio se esgota", que só existe na aposentadoria.
    expect(idadeEsgotamento).toBeNull();
  });

  it("devolve a curva intacta quando não há objetivos", () => {
    const pontos = curvaPlana(30, 3, 100000);

    expect(aplicarObjetivosNaCurva(pontos, [], 5).pontos).toEqual(pontos);
  });
});

describe("valorMensalSugeridoObjetivo", () => {
  it("projeta o valor estimado pela inflação e divide pelos meses até o horizonte", () => {
    const sugerido = valorMensalSugeridoObjetivo(
      { valor_estimado: 120000, horizonte_anos: 5 },
      4,
    );

    const valorFuturo = 120000 * Math.pow(1.04, 5);
    expect(sugerido).toBeCloseTo(valorFuturo / 60, 6);
  });

  // Regressão do bloqueio apontado na revisão: sem prazo não existe aporte
  // mensal a sugerir. Um piso de 1 mês faria uma meta de R$ 100 mil virar
  // "guardar R$ 100 mil por mês".
  it("devolve null quando o objetivo não tem prazo", () => {
    expect(
      valorMensalSugeridoObjetivo(
        { valor_estimado: 100000, horizonte_anos: null },
        4,
      ),
    ).toBeNull();
  });

  it("devolve null quando o horizonte é zero, em vez de usar piso de 1 mês", () => {
    expect(
      valorMensalSugeridoObjetivo({ valor_estimado: 1000, horizonte_anos: 0 }, 4),
    ).toBeNull();
  });

  it("trata valor estimado nulo como 0 quando há prazo", () => {
    expect(
      valorMensalSugeridoObjetivo({ valor_estimado: null, horizonte_anos: 5 }, 4),
    ).toBe(0);
  });
});

describe("explicarTendenciaPatrimonio", () => {
  const base = {
    aporteMensal: 1000,
    saqueMensalAposentadoria: 3000,
    idadeEsgotamento: null as number | null,
    expectativaVida: 90,
    saldoInicioAposentadoria: 1_000_000,
    saldoFinalSimulacao: 1_000_000,
    idadeFinalSimulacao: 90,
  };

  it("aponta aportes insuficientes quando não há capacidade de investimento", () => {
    const texto = explicarTendenciaPatrimonio({ ...base, aporteMensal: 0 });

    expect(texto).toContain("aportes insuficientes");
  });

  it("explica o esgotamento por retirada maior que rendimento quando o patrimônio se esgota antes da expectativa de vida", () => {
    const texto = explicarTendenciaPatrimonio({
      ...base,
      saqueMensalAposentadoria: 8000,
      idadeEsgotamento: 82,
      saldoFinalSimulacao: 0,
      idadeFinalSimulacao: 82,
    });

    expect(texto).toContain("82 anos");
    expect(texto).toContain("antes da expectativa de vida de 90 anos");
  });

  // Regressão do bloqueio apontado na revisão: idadeEsgotamento === null só
  // diz que o saldo não zerou até o fim da simulação — NÃO que o principal
  // tenha sido preservado. Uma curva caindo de R$ 1.000.000 para R$ 871.800
  // sem zerar tem que ser descrita como queda/consumo de principal.
  it("descreve queda e consumo de principal quando o saldo cai sem zerar", () => {
    const texto = explicarTendenciaPatrimonio({
      ...base,
      saqueMensalAposentadoria: 5000,
      idadeEsgotamento: null,
      saldoInicioAposentadoria: 1_000_000,
      saldoFinalSimulacao: 871_800,
    });

    expect(texto).toContain("cai");
    expect(texto).toContain("principal");
    expect(texto).not.toContain("sem consumir o saldo principal");
    expect(texto).not.toContain("continua subindo");
    expect(texto).not.toContain("praticamente estável");
  });

  it("descreve crescimento quando o saldo termina acima do início da aposentadoria", () => {
    const texto = explicarTendenciaPatrimonio({
      ...base,
      saldoInicioAposentadoria: 1_000_000,
      saldoFinalSimulacao: 1_400_000,
    });

    expect(texto).toContain("continua subindo");
  });

  it("descreve estabilidade quando o saldo termina praticamente igual ao início", () => {
    const texto = explicarTendenciaPatrimonio({
      ...base,
      saldoInicioAposentadoria: 1_000_000,
      saldoFinalSimulacao: 1_002_000,
    });

    expect(texto).toContain("praticamente estável");
  });

  it("usa linguagem de projeção, sem afirmar certeza sobre o futuro", () => {
    const caindo = explicarTendenciaPatrimonio({
      ...base,
      saldoFinalSimulacao: 500_000,
    });
    const subindo = explicarTendenciaPatrimonio({
      ...base,
      saldoFinalSimulacao: 1_400_000,
    });

    expect(caindo).toContain("nesta simulação");
    expect(subindo).toContain("com as premissas informadas");
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
