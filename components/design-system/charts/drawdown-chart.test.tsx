import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DrawdownChart } from "./drawdown-chart";

const pontos = [
  { idade: 65, saldo: 1000000 },
  { idade: 66, saldo: 900000 },
  { idade: 67, saldo: 780000 },
];

describe("DrawdownChart", () => {
  it("deixa o desenho encolher com a tela em vez de empurrar a página", () => {
    const html = renderToStaticMarkup(
      createElement(DrawdownChart, { pontos, idadeEsgotamento: null }),
    );

    // O viewBox sozinho não basta: os atributos width/height dão ao SVG uma
    // largura intrínseca de 720px, que no celular criava rolagem horizontal
    // na página inteira, não só no gráfico.
    expect(html).toContain('viewBox="0 0 720 280"');
    expect(html).toContain("max-w-full");
  });
});
