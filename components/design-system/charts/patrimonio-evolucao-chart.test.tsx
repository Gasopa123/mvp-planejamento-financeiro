import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  PatrimonioEvolucaoChart,
  anoLabelStep,
  pontoMaisProximo,
} from "./patrimonio-evolucao-chart";

const pontos = [
  { idadeAnos: 36, saldo: 100000, fase: "acumulacao" as const },
  { idadeAnos: 37, saldo: 130000, fase: "acumulacao" as const },
  { idadeAnos: 38, saldo: 165000, fase: "acumulacao" as const },
];

describe("PatrimonioEvolucaoChart", () => {
  it("mostra anos sem lotar o eixo e prepara tooltip customizado", () => {
    const html = renderToStaticMarkup(
      createElement(PatrimonioEvolucaoChart, {
        pontos,
        idadeAposentadoria: 65,
        idadeEsgotamento: null,
      }),
    );

    expect(html).toContain(">37<");
    expect(html).toContain("Passe o cursor na linha");
    expect(html).not.toContain("37 anos —");
  });

  it("encontra o ponto correto mais perto do cursor", () => {
    expect(pontoMaisProximo(pontos, 37.2)).toEqual(pontos[1]);
    expect(pontoMaisProximo(pontos, 37.8)).toEqual(pontos[2]);
  });

  it("reduz labels quando o horizonte é longo", () => {
    expect(anoLabelStep(36, 46)).toBe(1);
    expect(anoLabelStep(36, 90)).toBe(5);
  });

  it("renderiza curva com e sem objetivos para visualizar o impacto", () => {
    const html = renderToStaticMarkup(
      createElement(PatrimonioEvolucaoChart, {
        pontos,
        pontosComparacao: pontos.map((p) => ({ ...p, saldo: p.saldo + 50000 })),
        idadeAposentadoria: 65,
        idadeEsgotamento: null,
      }),
    );

    expect(html).toContain("Sem objetivos");
    expect(html).toContain("Com objetivos");
  });

  it("usa tinta forte nos rótulos dourados pequenos", () => {
    const html = renderToStaticMarkup(
      createElement(PatrimonioEvolucaoChart, {
        pontos,
        idadeAposentadoria: 37,
        idadeEsgotamento: 38,
        objetivos: [
          {
            id: "obj-1",
            client_id: "client-1",
            descricao: "Meta",
            valor_estimado: 10000,
            horizonte_anos: 1,
            prazo: "curto",
          },
        ],
      }),
    );

    expect(html.split("var(--color-gold-ink-strong)").length - 1).toBe(2);
  });

  it("renderiza a curva visível já no HTML inicial", () => {
    const html = renderToStaticMarkup(
      createElement(PatrimonioEvolucaoChart, {
        pontos,
        pontosComparacao: pontos.map((p) => ({ ...p, saldo: p.saldo + 50000 })),
        idadeAposentadoria: 37,
        idadeEsgotamento: null,
      }),
    );

    expect(html).toContain('opacity="1"');
    expect(html).not.toContain('opacity="0"');
  });
});
