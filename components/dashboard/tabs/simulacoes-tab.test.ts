import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/types/cliente";
import { SimulacoesTab } from "./simulacoes-tab";

const cliente = {
  idade: 36,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  patrimonio_investido: 100000,
  renda_mensal: 10000,
  despesa_mensal: 5000,
  pretensao_salarial_aposentadoria: 15000,
};

const clienteCompleto = cliente as unknown as Cliente;

describe("SimulacoesTab", () => {
  it("permite renda desejada até 1 milhão e mostra atualização automática de IPCA/CDI", () => {
    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, { cliente: clienteCompleto, assumptions: null }),
    );

    expect(html).toContain('max="1000000"');
    expect(html).toContain("IPCA/CDI automáticos");
    expect(html).toContain("2 casas decimais");
  });
});
