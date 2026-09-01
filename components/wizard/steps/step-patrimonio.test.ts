import { describe, expect, it } from "vitest";
import { resumirPatrimonio } from "./step-patrimonio";
import type { PropriedadeDraft } from "@/lib/wizard/types";

function propriedade(
  valor: number | null,
  financiado = false,
  adquiridoAposCasamento = false,
): PropriedadeDraft {
  return {
    valor,
    financiado,
    adquiridoAposCasamento,
    subtipo: "casa",
    modelo: "",
    financiamentoTermino: financiado ? "2030-12-31" : null,
    parcelaFinanciamento: financiado ? 2500 : null,
  };
}

describe("resumirPatrimonio", () => {
  it("soma o valor total de imóveis e automóveis separadamente", () => {
    const resumo = resumirPatrimonio(
      [propriedade(300000), propriedade(200000)],
      [propriedade(50000)],
    );

    expect(resumo.totalImoveis).toBe(500000);
    expect(resumo.totalAutomoveis).toBe(50000);
    expect(resumo.totalBens).toBe(550000);
  });

  it("trata valor null como 0 na soma", () => {
    const resumo = resumirPatrimonio(
      [propriedade(300000), propriedade(null)],
      [propriedade(null)],
    );

    expect(resumo.totalImoveis).toBe(300000);
    expect(resumo.totalAutomoveis).toBe(0);
    expect(resumo.totalBens).toBe(300000);
  });

  it("conta bens financiados somando imóveis e automóveis financiados", () => {
    const resumo = resumirPatrimonio(
      [propriedade(300000, true), propriedade(200000, false)],
      [propriedade(50000, true), propriedade(20000, true)],
    );

    expect(resumo.quantidadeFinanciados).toBe(3);
  });

  it("retorna zeros quando não há imóveis nem automóveis", () => {
    const resumo = resumirPatrimonio([], []);

    expect(resumo).toEqual({
      totalImoveis: 0,
      totalAutomoveis: 0,
      totalBens: 0,
      quantidadeFinanciados: 0,
    });
  });
});


import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StepPatrimonio } from "./step-patrimonio";

// Extrai o estado do par de rádios Sim/Não de um SimNaoField no HTML gerado.
// A primeira tag é "Sim" e a segunda é "Não" (ver components/wizard/sim-nao-field.tsx).
function radioMarcado(html: string, name: string): "sim" | "nao" {
  const tags = html.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`, "g")) ?? [];
  if (tags.length !== 2) {
    throw new Error(`esperava 2 rádios para "${name}", achei ${tags.length}`);
  }
  return tags[0].includes("checked") ? "sim" : "nao";
}

function renderStepPatrimonio(
  imoveis: PropriedadeDraft[],
  automoveis: PropriedadeDraft[],
): string {
  return renderToStaticMarkup(
    createElement(StepPatrimonio, {
      imoveis,
      automoveis,
      errors: {},
      onAddImovel: () => {},
      onRemoveImovel: () => {},
      onChangeImovel: () => {},
      onAddAutomovel: () => {},
      onRemoveAutomovel: () => {},
      onChangeAutomovel: () => {},
    }),
  );
}

// Regressão do bloqueio apontado na revisão: o rádio "Possui imóveis/automóveis?"
// não pode continuar em "Sim" depois que o último bem é removido. O valor é
// derivado da própria lista, então lista vazia sempre volta pra "Não".
describe("StepPatrimonio — rádio Possui imóveis/automóveis", () => {
  it("marca 'Não' quando não há bens cadastrados", () => {
    const html = renderStepPatrimonio([], []);

    expect(radioMarcado(html, "possuiImoveis")).toBe("nao");
    expect(radioMarcado(html, "possuiAutomoveis")).toBe("nao");
  });

  it("marca 'Sim' quando há bens cadastrados", () => {
    const html = renderStepPatrimonio([propriedade(300000)], [propriedade(50000)]);

    expect(radioMarcado(html, "possuiImoveis")).toBe("sim");
    expect(radioMarcado(html, "possuiAutomoveis")).toBe("sim");
  });

  it("volta pra 'Não' quando o último imóvel/automóvel é removido", () => {
    const comBens = renderStepPatrimonio([propriedade(300000)], [propriedade(50000)]);
    expect(radioMarcado(comBens, "possuiImoveis")).toBe("sim");
    expect(radioMarcado(comBens, "possuiAutomoveis")).toBe("sim");

    // Estado após remover o último item de cada lista.
    const semBens = renderStepPatrimonio([], []);
    expect(radioMarcado(semBens, "possuiImoveis")).toBe("nao");
    expect(radioMarcado(semBens, "possuiAutomoveis")).toBe("nao");
  });

  it("esconde a lista de bens enquanto a resposta for 'Não'", () => {
    const html = renderStepPatrimonio([], []);

    expect(html).not.toContain("+ Adicionar imóvel");
    expect(html).not.toContain("+ Adicionar automóvel");
  });

  it("mantém rádios independentes entre imóveis e automóveis", () => {
    const html = renderStepPatrimonio([propriedade(300000)], []);

    expect(radioMarcado(html, "possuiImoveis")).toBe("sim");
    expect(radioMarcado(html, "possuiAutomoveis")).toBe("nao");
  });
});

describe("StepPatrimonio campos detalhados", () => {
  it("renderiza tipo do bem, modelo e campos de financiamento", () => {
    const html = renderToStaticMarkup(
      createElement(StepPatrimonio, {
        imoveis: [propriedade(300000, true)],
        automoveis: [{ ...propriedade(50000, true), subtipo: "carro", modelo: "Corolla" }],
        errors: {},
        onAddImovel: () => {},
        onRemoveImovel: () => {},
        onChangeImovel: () => {},
        onAddAutomovel: () => {},
        onRemoveAutomovel: () => {},
        onChangeAutomovel: () => {},
      }),
    );

    expect(html).toContain("Tipo");
    expect(html).toContain("Modelo");
    expect(html).toContain("Previsão de término");
    expect(html).toContain("Parcela do financiamento");
  });
});
