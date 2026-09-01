import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente, Objetivo } from "@/lib/types/cliente";
import { AposentadoriaTab } from "./aposentadoria-tab";
import { SimulacoesTab } from "./simulacoes-tab";

const cliente = {
  id: "client-1",
  idade: 36,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  renda_mensal: 10000,
  despesa_mensal: 5000,
  patrimonio_investido: 100000,
  pretensao_salarial_aposentadoria: 12000,
} as Cliente;

describe("AposentadoriaTab", () => {
  it("permite editar premissas de aposentadoria sob demanda", () => {
    const html = renderToStaticMarkup(createElement(AposentadoriaTab, { cliente, objetivos: [], assumptions: null }));

    expect(html).toContain("Editar aposentadoria");
    expect(html).toContain('name="idade_aposentadoria"');
    expect(html).toContain('name="expectativa_vida"');
    expect(html).toContain('name="pretensao_salarial_aposentadoria"');
  });

  it("pede correção quando a idade de aposentadoria é menor ou igual à atual", () => {
    const clienteIdadeInvalida = {
      ...cliente,
      idade: 70,
      idade_aposentadoria: 65,
    } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(AposentadoriaTab, { cliente: clienteIdadeInvalida, objetivos: [], assumptions: null }),
    );

    expect(html).toContain("menor ou igual à idade atual");
    expect(html).not.toContain("Patrimônio se esgota aos");
    expect(html).not.toContain("Patrimônio estimado ao se aposentar");
  });

  // expectativa_vida <= idade_aposentadoria não deixa aposentadoria pra
  // simular: o drawdown não roda, idadeEsgotamento volta null e a tela
  // concluiria que o patrimônio "sustenta" — falso, vindo de dado inválido.
  it.each([
    ["igual à idade de aposentadoria", 65],
    ["menor que a idade de aposentadoria", 60],
  ])("não diz que o patrimônio sustenta quando a expectativa de vida é %s", (_caso, expectativaVida) => {
    const clienteExpectativaInvalida = {
      ...cliente,
      idade: 40,
      idade_aposentadoria: 65,
      expectativa_vida: expectativaVida,
    } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(AposentadoriaTab, {
        cliente: clienteExpectativaInvalida,
        assumptions: null,
      }),
    );

    expect(html).toContain("menor ou igual à idade de aposentadoria");
    expect(html).not.toContain("sustenta");
    expect(html).not.toContain("Patrimônio estimado ao se aposentar");
    expect(html).not.toContain("Objetivo atingido");
  });

  // O formulário de edição é onde o advisor corrige o dado — some-lo na tela
  // de erro deixava o usuário sem saída.
  it.each([
    ["idade de aposentadoria menor que a atual", { idade: 70, idade_aposentadoria: 65 }],
    ["expectativa de vida menor que a aposentadoria", { idade: 40, idade_aposentadoria: 65, expectativa_vida: 60 }],
    ["dados de idade ausentes", { idade: null, idade_aposentadoria: null, expectativa_vida: null }],
  ])("mantém o formulário de correção visível quando %s", (_caso, patch) => {
    const clienteInvalido = { ...cliente, ...patch } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(AposentadoriaTab, { cliente: clienteInvalido, objetivos: [], assumptions: null }),
    );

    expect(html).toContain("Editar aposentadoria");
    expect(html).toContain('name="idade_aposentadoria"');
    expect(html).toContain('name="expectativa_vida"');
    // ...sem simulação falsa junto.
    expect(html).not.toContain("Patrimônio estimado ao se aposentar");
    expect(html).not.toContain("Objetivo atingido");
  });

  // A idade de esgotamento vem de computeDrawdown começando na aposentadoria,
  // então nunca pode cair antes dela nem na idade atual do cliente.
  it("não afirma esgotamento antes da idade de aposentadoria", () => {
    const clienteJovem = {
      ...cliente,
      idade: 26,
      idade_aposentadoria: 65,
      expectativa_vida: 100,
      patrimonio_investido: 0,
      renda_mensal: 12000,
      despesa_mensal: 9500,
      pretensao_salarial_aposentadoria: 40000,
    } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(AposentadoriaTab, { cliente: clienteJovem, objetivos: [], assumptions: null }),
    );

    expect(html).not.toContain("se esgota aos 26 anos");
    const esgotamento = html.match(/se esgota aos (\d+) anos/);
    if (esgotamento) {
      expect(Number(esgotamento[1])).toBeGreaterThanOrEqual(65);
    }
  });
});

// QA encontrou as duas abas contando histórias diferentes do mesmo cliente:
// Aposentadoria calculava sem objetivos ("se esgota aos 65") enquanto
// Simulações, na mesma página, dizia que os objetivos comprometiam o
// patrimônio aos 32.
describe("AposentadoriaTab x SimulacoesTab — mesma história", () => {
  const clienteApertado = {
    ...cliente,
    idade: 30,
    idade_aposentadoria: 60,
    expectativa_vida: 90,
    renda_mensal: 10000,
    despesa_mensal: 9500,
    patrimonio_investido: 50000,
  } as unknown as Cliente;

  const objetivoAbsurdo = [
    {
      id: "obj-caro",
      client_id: "client-1",
      prazo: "medio" as const,
      descricao: "Mansão",
      valor_estimado: 5_000_000,
      horizonte_anos: 2,
    },
  ] satisfies Objetivo[];

  function renderAposentadoria(objetivos: Objetivo[]) {
    return renderToStaticMarkup(
      createElement(AposentadoriaTab, { cliente: clienteApertado, objetivos, assumptions: null }),
    );
  }

  it("mostra déficit pré-aposentadoria, não veredito de esgotamento", () => {
    const html = renderAposentadoria(objetivoAbsurdo);

    expect(html).toContain("Os objetivos comprometem o patrimônio aos 32 anos");
    expect(html).toContain(
      "Os objetivos comprometem o patrimônio antes da aposentadoria. Revise prazo, valor ou aporte.",
    );
    expect(html).not.toContain("Patrimônio se esgota aos");
    expect(html).not.toContain("Objetivo atingido");
  });

  it("conta a mesma história que Simulações no caso do objetivo absurdo", () => {
    const apo = renderAposentadoria(objetivoAbsurdo);
    const sim = renderToStaticMarkup(
      createElement(SimulacoesTab, {
        cliente: clienteApertado,
        objetivos: objetivoAbsurdo,
        assumptions: null,
      }),
    );

    const deficit = "Os objetivos comprometem o patrimônio aos 32 anos";
    expect(apo).toContain(deficit);
    expect(sim).toContain(deficit);
    // Nenhuma das duas pode anunciar esgotamento de aposentadoria nesse caso.
    expect(apo).not.toContain("Patrimônio se esgota aos");
    expect(sim).not.toContain("Patrimônio se esgota aos");
  });

  it("desconta os objetivos do patrimônio estimado ao se aposentar", () => {
    const semObjetivos = renderAposentadoria([]);
    const comObjetivo = renderAposentadoria([
      {
        id: "obj-1",
        client_id: "client-1",
        prazo: "medio" as const,
        descricao: "Carro",
        valor_estimado: 100000,
        horizonte_anos: 5,
      },
    ] satisfies Objetivo[]);

    const valor = (html: string) =>
      html.match(/Patrimônio estimado ao se aposentar<\/div><div[^>]*>([^<]+)</)?.[1] ?? "";

    expect(valor(semObjetivos)).not.toBe("");
    expect(valor(comObjetivo)).not.toBe("");
    expect(valor(comObjetivo)).not.toBe(valor(semObjetivos));
  });
});
