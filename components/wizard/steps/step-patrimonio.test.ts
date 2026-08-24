import { describe, expect, it } from "vitest";
import { resumirPatrimonio } from "./step-patrimonio";
import type { PropriedadeDraft } from "@/lib/wizard/types";

function propriedade(
  valor: number | null,
  financiado = false,
  adquiridoAposCasamento = false,
): PropriedadeDraft {
  return { valor, financiado, adquiridoAposCasamento };
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
