import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente, Objetivo } from "@/lib/types/cliente";
import { PlanoAcaoTab } from "./plano-acao-tab";

const cliente = {
  id: "client-1",
  idade: 30,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  renda_mensal: 10000,
  despesa_mensal: 5000,
  patrimonio_investido: 100000,
  pretensao_salarial_aposentadoria: 12000,
  tem_seguro_vida: false,
  tem_participacao_societaria: false,
} as unknown as Cliente;

function render(over: Partial<Cliente>, objetivos: Objetivo[] = []) {
  return renderToStaticMarkup(
    createElement(PlanoAcaoTab, {
      cliente: { ...cliente, ...over } as Cliente,
      conjuge: null,
      filhos: [],
      objetivos,
      assumptions: null,
    }),
  );
}

describe("PlanoAcaoTab — dados de aposentadoria inválidos", () => {
  // O QA pegou o plano afirmando "sustentar a aposentadoria até os 65 anos"
  // enquanto Aposentadoria e Simulações já bloqueavam o mesmo cliente.
  it("não afirma sustentabilidade quando a expectativa de vida <= idade de aposentadoria", () => {
    const html = render({ idade: 40, idade_aposentadoria: 65, expectativa_vida: 65 });

    expect(html).not.toContain("sustentar a aposentadoria");
    expect(html).toContain("Corrigir os dados de aposentadoria");
  });

  it("não afirma sustentabilidade quando a idade de aposentadoria <= idade atual", () => {
    const html = render({ idade: 65, idade_aposentadoria: 60 });

    expect(html).not.toContain("sustentar a aposentadoria");
    expect(html).toContain("Corrigir os dados de aposentadoria");
  });

  it("volta a avaliar a aposentadoria quando os dados são coerentes", () => {
    const html = render({});

    expect(html).toContain("sustentar a aposentadoria até os 90 anos");
    expect(html).not.toContain("Corrigir os dados de aposentadoria");
  });
});

describe("PlanoAcaoTab — considera objetivos", () => {
  const clienteApertado = {
    idade: 30,
    idade_aposentadoria: 60,
    expectativa_vida: 90,
    renda_mensal: 10000,
    despesa_mensal: 9500,
    patrimonio_investido: 50000,
  };

  const objetivoAbsurdo = [
    {
      id: "obj-caro",
      client_id: "client-1",
      prazo: "medio" as const,
      descricao: "Mansão",
      valor_estimado: 5_000_000,
      horizonte_anos: 2,
    },
  ] satisfies Objetivo[];

  it("aponta o déficit causado pelos objetivos em vez de falar em sustentar a aposentadoria", () => {
    const html = render(clienteApertado, objetivoAbsurdo);

    expect(html).toContain("comprometem o patrimônio aos 32 anos");
    expect(html).toContain("Rever prazo, valor ou aporte dos objetivos");
    expect(html).not.toContain("sustentar a aposentadoria");
  });

  it("muda o veredito de aposentadoria conforme os objetivos cadastrados", () => {
    const semObjetivos = render(clienteApertado, []);
    const comObjetivos = render(clienteApertado, objetivoAbsurdo);

    expect(semObjetivos).toContain("sustentar a aposentadoria");
    expect(comObjetivos).not.toContain("sustentar a aposentadoria");
  });
});
