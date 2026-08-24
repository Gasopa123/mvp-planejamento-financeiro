import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente } from "@/lib/types/cliente";
import { PatrimonioTab } from "./patrimonio-tab";

const cliente = {
  patrimonio_investido: 100000,
  despesa_mensal: 5000,
  local_aplicado: "XP",
  tem_investimento_exterior: true,
  valor_investimento_exterior: 25000,
  tem_participacao_societaria: true,
  valor_participacao: 200000,
  percentual_participacao: 35,
};

const clienteCompleto = cliente as unknown as Cliente;

const imoveis = [
  {
    id: "imovel-1",
    client_id: "client-1",
    tipo: "imovel" as const,
    valor: 300000,
    financiado: true,
    adquirido_apos_casamento: true,
    subtipo: "apartamento",
    modelo: null,
    financiamento_termino: "2035-12-31",
    parcela_financiamento: 2500,
  },
];

const automoveis = [
  {
    id: "auto-1",
    client_id: "client-1",
    tipo: "automovel" as const,
    valor: 50000,
    financiado: true,
    adquirido_apos_casamento: false,
    subtipo: "carro",
    modelo: "Corolla",
    financiamento_termino: "2028-12-31",
    parcela_financiamento: 1200,
  },
];

describe("PatrimonioTab", () => {
  it("exibe detalhes de investimentos, bens e participação societária", () => {
    const html = renderToStaticMarkup(
      createElement(PatrimonioTab, { cliente: clienteCompleto, imoveis, automoveis }),
    );

    expect(html).toContain("XP");
    expect(html).toContain("Investimento no exterior");
    expect(html).toContain("Apartamento");
    expect(html).toContain("Corolla");
    expect(html).toContain("Parcela");
    expect(html).toContain("35");
  });
});
