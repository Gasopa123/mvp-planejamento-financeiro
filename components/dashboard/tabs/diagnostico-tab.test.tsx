import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/types/cliente";
import { DiagnosticoTab } from "./diagnostico-tab";

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
});
