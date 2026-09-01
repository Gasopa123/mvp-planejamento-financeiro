import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/types/cliente";
import { AposentadoriaTab } from "./aposentadoria-tab";

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
    const html = renderToStaticMarkup(createElement(AposentadoriaTab, { cliente, assumptions: null }));

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
      createElement(AposentadoriaTab, { cliente: clienteIdadeInvalida, assumptions: null }),
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
      createElement(AposentadoriaTab, { cliente: clienteJovem, assumptions: null }),
    );

    expect(html).not.toContain("se esgota aos 26 anos");
    const esgotamento = html.match(/se esgota aos (\d+) anos/);
    if (esgotamento) {
      expect(Number(esgotamento[1])).toBeGreaterThanOrEqual(65);
    }
  });
});
