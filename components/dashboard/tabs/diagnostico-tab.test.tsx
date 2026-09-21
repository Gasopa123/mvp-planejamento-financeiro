import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/types/cliente";
import { DiagnosticoTab } from "./diagnostico-tab";
import { formatarMoeda } from "@/lib/format";

const cliente = {
  id: "client-1",
  renda_mensal: 10000,
  despesa_mensal: 5000,
} as Cliente;

describe("DiagnosticoTab", () => {
  it("mostra botão de editar renda e despesa sem formulário fixo", () => {
    const html = renderToStaticMarkup(createElement(DiagnosticoTab, { cliente }));

    expect(html).toContain("Renda mensal");
    expect(html).toContain("Editar renda e despesas");
    expect(html).toContain('name="renda_mensal"');
    expect(html).toContain('name="despesa_mensal"');
  });

  // Densidade do canvas: cada indicador ganha uma linha derivada. A reserva
  // usa a mesma regra da seção Patrimônio (patrimônio contra 4× a despesa).
  it("mostra a linha de contexto de despesa, capacidade e reserva", () => {
    const render = (patrimonio: number | null) =>
      renderToStaticMarkup(
        createElement(DiagnosticoTab, {
          cliente: { ...cliente, patrimonio_investido: patrimonio } as Cliente,
        }),
      );

    const abaixo = render(12000);
    expect(abaixo).toContain("Reserva de emergência");
    expect(abaixo.match(/50% da renda/g)?.length).toBeGreaterThanOrEqual(2);
    expect(abaixo).toContain(`60% de ${formatarMoeda(20000)}`);
    expect(abaixo).not.toContain("da receita");

    expect(render(20000)).toContain(`acima do ideal de ${formatarMoeda(20000)}`);
    expect(render(null)).toContain("não informado");
  });
});
