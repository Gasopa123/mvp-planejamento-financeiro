import { describe, expect, it } from "vitest";
import { projetarPatrimonioComObjetivos } from "./calculos";
import {
  basesDaSimulacao,
  chaveDosValoresIniciais,
  derivarCenarioSimulado,
} from "./simulacao";
import type { Cliente, Objetivo } from "./types/cliente";

const cliente = {
  idade: 36,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  patrimonio_investido: 100000,
  renda_mensal: 10000,
  despesa_mensal: 5000,
  pretensao_salarial_aposentadoria: 15000,
} as unknown as Cliente;

const objetivo = [
  {
    id: "obj-1",
    client_id: "client-1",
    prazo: "medio" as const,
    descricao: "Comprar imóvel",
    valor_estimado: 200000,
    horizonte_anos: 5,
  },
] satisfies Objetivo[];

const premissas = {
  inflacaoProjetadaPct: 4.5,
  cdiAtualPct: 10.5,
  rentabilidadeRealPadraoPct: 5,
};

const cenarioBase = {
  idade: 36,
  idadeAposentadoria: 65,
  expectativaVida: 90,
  patrimonioInicial: 100000,
  objetivos: [] as Objetivo[],
  capacidadeAtual: 5000,
  aporte: 5000,
  rendaDesejada: 15000,
  tipoRentabilidade: "ipca_mais" as const,
  spreadIpcaPct: 5,
  percentualCdiPct: 100,
  prefixadaPct: 10,
  cdiAtualPct: 10.5,
  inflacaoParaTaxaRealPct: 4.5,
  inflacaoProjetadaPct: 4.5,
  anosDoHorizonte: null,
};

describe("basesDaSimulacao", () => {
  it("parte da capacidade cheia mesmo havendo objetivos", () => {
    const bases = basesDaSimulacao({ cliente, objetivos: objetivo, ...premissas });

    expect(bases.capacidadeAtual).toBe(5000);
    expect(bases.aporteInicial).toBe(5000);
    // O custo mensal dos objetivos aparece à parte, como leitura alternativa,
    // e não é descontado do aporte inicial.
    expect(bases.impactoDosObjetivos.aporteMensalObjetivos).toBeGreaterThan(0);
  });
});

describe("derivarCenarioSimulado", () => {
  it("corta a curva no horizonte escolhido", () => {
    const cheio = derivarCenarioSimulado(cenarioBase);
    const dezAnos = derivarCenarioSimulado({ ...cenarioBase, anosDoHorizonte: 10 });

    expect(dezAnos.pontosDaCurva.length).toBeLessThan(cheio.pontosDaCurva.length);
    expect(dezAnos.pontosDaCurva.every((p) => p.idadeAnos <= 46)).toBe(true);
  });

  it("chama déficit pré-aposentadoria de déficit, e não de esgotamento", () => {
    const objetivoImpagavel = [
      {
        id: "obj-caro",
        client_id: "client-1",
        prazo: "medio" as const,
        descricao: "Casa nova",
        valor_estimado: 5_000_000,
        horizonte_anos: 2,
      },
    ] satisfies Objetivo[];

    const cenario = derivarCenarioSimulado({
      ...cenarioBase,
      idade: 30,
      idadeAposentadoria: 60,
      patrimonioInicial: 50000,
      capacidadeAtual: 500,
      aporte: 500,
      objetivos: objetivoImpagavel,
    });

    expect(cenario.idadeDeficitPreAposentadoria).not.toBeNull();
    expect(cenario.sustentavel).toBe(false);
  });
});

describe("chaveDosValoresIniciais", () => {
  it("muda quando muda o que semeia os controles, e só nesse caso", () => {
    const base = chaveDosValoresIniciais(cliente, null);

    // Renda, despesa e pretensão semeiam aporte e renda desejada: mexeu, a
    // aba precisa ser re-semeada.
    for (const patch of [
      { renda_mensal: 12000 },
      { despesa_mensal: 3000 },
      { pretensao_salarial_aposentadoria: 20000 },
    ]) {
      expect(
        chaveDosValoresIniciais({ ...cliente, ...patch } as Cliente, null),
      ).not.toBe(base);
    }

    // O que não semeia controle nenhum não pode remontar a aba e jogar fora
    // o cenário que o assessor já ajustou na tela.
    expect(
      chaveDosValoresIniciais(
        { ...cliente, nome: "Outro nome", patrimonio_investido: 999999 } as Cliente,
        null,
      ),
    ).toBe(base);
  });
});

// A aba Simulações tem um campo de IPCA editável, semeado pelo Banco Central,
// que serve para converter %CDI e Prefixado em taxa real. Ele não pode corrigir
// os objetivos: no QA o feed veio com -3,77% e a mesma meta do mesmo cliente
// custava um valor em Simulações e outro em Aposentadoria.
describe("inflação dos objetivos vem sempre da premissa salva", () => {
  const objetivo = [
    {
      id: "obj-1",
      client_id: "client-1",
      prazo: "medio" as const,
      descricao: "Comprar imóvel",
      valor_estimado: 200000,
      horizonte_anos: 5,
    },
  ] satisfies Objetivo[];

  const cenario = {
    ...cenarioBase,
    objetivos: objetivo,
    // O que o painel mostra hoje, vindo do feed, bem longe da premissa.
    inflacaoParaTaxaRealPct: -3.77,
    inflacaoProjetadaPct: 4,
  };

  function projecaoCom(inflacao: number) {
    return projetarPatrimonioComObjetivos({
      idadeAtual: cenario.idade,
      idadeAposentadoria: cenario.idadeAposentadoria,
      patrimonioInicial: cenario.patrimonioInicial,
      aporteMensal: cenario.aporte,
      saqueMensalAposentadoria: cenario.rendaDesejada,
      taxaAnualPct: derivarCenarioSimulado(cenario).rentabilidadeReal,
      inflacaoProjetadaPct: inflacao,
      objetivos: objetivo,
    }).patrimonioNaAposentadoria;
  }

  it("projeta a meta pela premissa do plano, não pelo IPCA editável do painel", () => {
    const daTela = derivarCenarioSimulado(cenario).patrimonioNaAposentadoria;

    expect(daTela).toBeCloseTo(projecaoCom(4), 2);
    expect(daTela).not.toBeCloseTo(projecaoCom(-3.77), 2);
  });

  it("o IPCA editável continua valendo para converter a taxa real", () => {
    const comCdi = derivarCenarioSimulado({
      ...cenario,
      tipoRentabilidade: "percentual_cdi" as const,
    }).rentabilidadeReal;
    const comOutraInflacao = derivarCenarioSimulado({
      ...cenario,
      tipoRentabilidade: "percentual_cdi" as const,
      inflacaoParaTaxaRealPct: 6,
    }).rentabilidadeReal;

    expect(comCdi).not.toBeCloseTo(comOutraInflacao, 6);
  });
});
