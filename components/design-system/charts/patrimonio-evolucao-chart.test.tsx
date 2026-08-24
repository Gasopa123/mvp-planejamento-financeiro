import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PatrimonioEvolucaoChart } from "./patrimonio-evolucao-chart";

const pontos = [
  { idadeAnos: 36, saldo: 100000, fase: "acumulacao" as const },
  { idadeAnos: 37, saldo: 130000, fase: "acumulacao" as const },
  { idadeAnos: 38, saldo: 165000, fase: "acumulacao" as const },
];

describe("PatrimonioEvolucaoChart", () => {
  it("mostra anos no eixo e tooltip de valor ao passar o mouse", () => {
    const html = renderToStaticMarkup(
      createElement(PatrimonioEvolucaoChart, {
        pontos,
        idadeAposentadoria: 65,
        idadeEsgotamento: null,
      }),
    );

    expect(html).toContain(">37<");
    expect(html).toContain("37 anos —");
    expect(html).toContain("R$");
  });
});
