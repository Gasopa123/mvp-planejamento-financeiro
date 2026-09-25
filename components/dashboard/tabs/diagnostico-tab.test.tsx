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
  // As notas são lidas card a card pelo rótulo, porque a legenda do donut
  // repete o mesmo "X% da renda" e esconderia uma nota errada.
  const render = (patch: Partial<Cliente>) =>
    renderToStaticMarkup(
      createElement(DiagnosticoTab, { cliente: { ...cliente, ...patch } as Cliente }),
    );

  // StatCard: rótulo, valor, e a nota (se houver) na div seguinte.
  const notaDe = (html: string, rotulo: string) =>
    html.match(
      new RegExp(`>${rotulo}</div><div[^>]*>[^<]*</div>(?:<div class="mt-1\.5[^"]*">([^<]*)</div>)?`),
    )?.[1];

  it("mostra a nota de cada indicador a partir da renda", () => {
    const html = render({ patrimonio_investido: 12000 });

    expect(notaDe(html, "Renda mensal")).toBeUndefined();
    expect(notaDe(html, "Despesa mensal")).toBe("50% da renda");
    expect(notaDe(html, "Capacidade de investimento")).toBe("50% da renda");
    expect(notaDe(html, "Reserva de emergência")).toBe(`60% de ${formatarMoeda(20000)}`);
    expect(html).not.toContain("da receita");
    expect(html).toContain("50% da renda é investida todos os meses");
  });

  it("marca a reserva acima do ideal e não inventa nota sem patrimônio", () => {
    expect(notaDe(render({ patrimonio_investido: 20000 }), "Reserva de emergência")).toBe(
      `acima do ideal de ${formatarMoeda(20000)}`,
    );

    const semPatrimonio = render({ patrimonio_investido: null });
    expect(notaDe(semPatrimonio, "Reserva de emergência")).toBeUndefined();
    expect(semPatrimonio).toContain("não informado");
  });

  // Renda zero passa no schema; proporção sobre ela não existe.
  it("não mostra proporção da renda quando a renda é zero", () => {
    const html = render({ renda_mensal: 0, patrimonio_investido: 12000 });

    expect(notaDe(html, "Despesa mensal")).toBe("renda não informada");
    expect(notaDe(html, "Capacidade de investimento")).toBe("renda não informada");
    expect(html).not.toContain("100% da renda");
    // A legenda do donut usa as mesmas notas.
    expect(html).toContain(`${formatarMoeda(5000)} · renda não informada`);
    expect(html).toContain(`${formatarMoeda(-5000)} · renda não informada`);

    // A taxa de poupança também é proporção da renda.
    expect(html).toContain("Renda não informada para calcular taxa de poupança.");
    expect(html).not.toContain("0% da renda é investida todos os meses");
  });
});
