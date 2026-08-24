import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StepAposentadoria, resumirAposentadoria } from "./step-aposentadoria";
import { formatarMoeda } from "@/lib/format";

describe("resumirAposentadoria", () => {
  it("calcula o resumo normalmente quando todos os dados estão disponíveis", () => {
    expect(resumirAposentadoria(30, 65, 85, 5000)).toEqual({
      idadeAtual: 30,
      idadeAlvo: 65,
      tempoRestante: 35,
      expectativaVida: 85,
      anosPosAposentadoria: 20,
      pretensaoMensalFormatada: formatarMoeda(5000),
    });
  });

  it("usa clamp em 0 quando a idade alvo é menor que a idade atual", () => {
    const resumo = resumirAposentadoria(70, 65, 85, 5000);
    expect(resumo?.tempoRestante).toBe(0);
  });

  it("usa clamp em 0 quando a expectativa de vida é menor que a idade alvo", () => {
    const resumo = resumirAposentadoria(30, 65, 60, 5000);
    expect(resumo?.anosPosAposentadoria).toBe(0);
  });

  it("retorna null quando falta algum dado necessário", () => {
    expect(resumirAposentadoria(null, 65, 85, 5000)).toBeNull();
    expect(resumirAposentadoria(30, null, 85, 5000)).toBeNull();
    expect(resumirAposentadoria(30, 65, null, 5000)).toBeNull();
    expect(resumirAposentadoria(30, 65, 85, null)).toBeNull();
  });
});

describe("StepAposentadoria", () => {
  it("renderiza o resumo quando há dados suficientes", () => {
    const html = renderToStaticMarkup(
      createElement(StepAposentadoria, {
        idade: 30,
        idadeAposentadoria: 65,
        expectativaVida: 85,
        pretensaoSalarialAposentadoria: 5000,
        errors: {},
        onIdadeAposentadoriaChange: () => {},
        onExpectativaVidaChange: () => {},
        onPretensaoSalarialAposentadoriaChange: () => {},
      }),
    );

    expect(html).toContain("35");
    expect(html).toContain("20");
    expect(html).toContain(formatarMoeda(5000));
  });

  it("não renderiza o resumo quando falta algum dado", () => {
    const html = renderToStaticMarkup(
      createElement(StepAposentadoria, {
        idade: null,
        idadeAposentadoria: 65,
        expectativaVida: 85,
        pretensaoSalarialAposentadoria: 5000,
        errors: {},
        onIdadeAposentadoriaChange: () => {},
        onExpectativaVidaChange: () => {},
        onPretensaoSalarialAposentadoriaChange: () => {},
      }),
    );

    expect(html).not.toContain("Tempo restante até a aposentadoria");
  });
});
