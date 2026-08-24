import { describe, expect, it } from "vitest";
import { resumirObjetivos } from "./step-objetivos";
import type { ObjetivoDraft } from "@/lib/wizard/types";

function objetivo(
  prazo: ObjetivoDraft["prazo"],
  valorEstimado: number | null = null,
  horizonteAnos: number | null = null,
): ObjetivoDraft {
  return { prazo, descricao: "", valorEstimado, horizonteAnos };
}

describe("resumirObjetivos", () => {
  it("conta o total de objetivos e a quantidade por prazo", () => {
    const resumo = resumirObjetivos([
      objetivo("curto"),
      objetivo("curto"),
      objetivo("medio"),
      objetivo("longo"),
    ]);

    expect(resumo.total).toBe(4);
    expect(resumo.porPrazo).toEqual({ curto: 2, medio: 1, longo: 1 });
  });

  it("soma os valores estimados ignorando null", () => {
    const resumo = resumirObjetivos([
      objetivo("curto", 1000),
      objetivo("medio", null),
      objetivo("longo", 5000),
    ]);

    expect(resumo.somaValorEstimado).toBe(6000);
  });

  it("acha o maior horizonte informado ignorando null", () => {
    const resumo = resumirObjetivos([
      objetivo("curto", null, 2),
      objetivo("medio", null, null),
      objetivo("longo", null, 10),
    ]);

    expect(resumo.maiorHorizonteAnos).toBe(10);
  });

  it("retorna zeros e maior horizonte null para lista vazia", () => {
    const resumo = resumirObjetivos([]);

    expect(resumo).toEqual({
      total: 0,
      porPrazo: { curto: 0, medio: 0, longo: 0 },
      somaValorEstimado: 0,
      maiorHorizonteAnos: null,
    });
  });
});
