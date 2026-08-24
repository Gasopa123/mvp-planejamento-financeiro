import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente, Objetivo } from "@/lib/types/cliente";
import { pontosAteHorizonte, SimulacoesTab } from "./simulacoes-tab";

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
const objetivos = [
  {
    id: "obj-1",
    client_id: "client-1",
    prazo: "medio" as const,
    descricao: "Comprar imóvel",
    valor_estimado: 200000,
    horizonte_anos: 5,
  },
] satisfies Objetivo[];

describe("SimulacoesTab", () => {
  it("permite renda desejada até 1 milhão e mostra atualização automática de IPCA/CDI", () => {
    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, { cliente: clienteCompleto, objetivos: [], assumptions: null }),
    );

    expect(html).toContain('max="1000000"');
    expect(html).toContain("IPCA/CDI automáticos");
    expect(html).toContain("2 casas decimais");
  });

  it("mostra curva única com horizontes, negativos e objetivos marcados", () => {
    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, { cliente: clienteCompleto, objetivos, assumptions: null }),
    );

    expect(html).toContain("Curva única do futuro financeiro");
    expect(html).toContain("2 anos");
    expect(html).toContain("5 anos");
    expect(html).toContain("10 anos");
    expect(html).toContain("Máximo");
    expect(html).toContain("Mostrar negativos");
    expect(html).toContain("Patrimônio total projetado");
    expect(html).toContain("Aposentadoria ideal");
    expect(html).toContain("Comprar imóvel");
    expect(html).toContain("Objetivos consomem capacidade");
    expect(html).toContain("Valor da recomendação");
    expect(html).toContain("Cenário atual");
    expect(html).toContain("Cenário recomendado");
  });

  it("filtra a curva no horizonte selecionado", () => {
    const pontos = [
      { idadeAnos: 36, saldo: 100, fase: "acumulacao" as const },
      { idadeAnos: 37, saldo: 150, fase: "acumulacao" as const },
      { idadeAnos: 38.1, saldo: 200, fase: "acumulacao" as const },
    ];

    expect(pontosAteHorizonte(pontos, 38)).toEqual(pontos.slice(0, 2));
  });
});
