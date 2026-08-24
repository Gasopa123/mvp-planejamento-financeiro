import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/types/cliente";
import { AposentadoriaTab } from "./aposentadoria-tab";

const cliente = {
  id: "client-1",
  idade: 36,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  renda_mensal: 10000,
  despesa_mensal: 5000,
  patrimonio_investido: 100000,
  pretensao_salarial_aposentadoria: 12000,
} as Cliente;

describe("AposentadoriaTab", () => {
  it("permite editar premissas de aposentadoria sob demanda", () => {
    const html = renderToStaticMarkup(createElement(AposentadoriaTab, { cliente, assumptions: null }));

    expect(html).toContain("Editar aposentadoria");
    expect(html).toContain('name="idade_aposentadoria"');
    expect(html).toContain('name="expectativa_vida"');
    expect(html).toContain('name="pretensao_salarial_aposentadoria"');
  });
});
