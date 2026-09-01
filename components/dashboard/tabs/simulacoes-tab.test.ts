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
    expect(html).toContain("Com objetivos");
    expect(html).toContain("Aposentadoria ideal");
    expect(html).toContain("Comprar imóvel");
    expect(html).toContain("Objetivos — leitura alternativa (poupar mês a mês)");
    expect(html).toContain("Valor da recomendação");
    expect(html).toContain("Cenário atual");
    expect(html).toContain("Cenário recomendado");
    expect(html).toContain("Sem objetivos");
    expect(html).toContain("Com objetivos");
    expect(html).toContain("Stress test");
    expect(html).toContain("Inflação +2%");
    expect(html).toContain("Aporte -30%");
  });

  // Regressão da dupla contagem: os objetivos já saem da curva como retirada
  // pontual no ano do horizonte, então o aporte mensal NÃO pode vir reduzido
  // por eles também — senão o mesmo objetivo é pago duas vezes.
  it("inicializa o aporte com a capacidade cheia, mesmo havendo objetivos", () => {
    const semObjetivos = renderToStaticMarkup(
      createElement(SimulacoesTab, { cliente: clienteCompleto, objetivos: [], assumptions: null }),
    );
    const comObjetivos = renderToStaticMarkup(
      createElement(SimulacoesTab, { cliente: clienteCompleto, objetivos, assumptions: null }),
    );

    // renda 10.000 - despesa 5.000 = capacidade cheia de 5.000.
    const sliderAporte = /aria-label="Aporte mensal até a aposentadoria"[^>]*value="(\d+)"/;
    const valorSemObjetivos = semObjetivos.match(sliderAporte)?.[1];
    const valorComObjetivos = comObjetivos.match(sliderAporte)?.[1];

    expect(valorSemObjetivos).toBe("5000");
    // Cadastrar um objetivo não pode encolher o aporte mensal da curva.
    expect(valorComObjetivos).toBe(valorSemObjetivos);
  });

  it("deixa claro que poupar mês a mês é alternativa, não soma com a retirada da curva", () => {
    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, { cliente: clienteCompleto, objetivos, assumptions: null }),
    );

    expect(html).toContain("não se somam");
    expect(html).toContain("saem do patrimônio de uma vez, no ano em que");
  });

  // Regressão do bug reportado: cliente de 26 anos, sem patrimônio investido,
  // com objetivo cadastrado. A tela mostrava "Patrimônio se esgota aos 26
  // anos" (a idade atual) mesmo projetando milhões na aposentadoria.
  it("não afirma que o patrimônio se esgota na idade atual do cliente", () => {
    const clienteSemPatrimonio = {
      ...cliente,
      idade: 26,
      expectativa_vida: 100,
      patrimonio_investido: 0,
      renda_mensal: 12000,
      despesa_mensal: 9500,
    } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, {
        cliente: clienteSemPatrimonio,
        objetivos,
        assumptions: null,
      }),
    );

    expect(html).not.toContain("Patrimônio se esgota aos 26 anos");
    expect(html).not.toContain("74 ano(s) antes da expectativa de vida");
  });

  it("pede correção quando a idade de aposentadoria é menor ou igual à atual", () => {
    const clienteIdadeInvalida = {
      ...cliente,
      idade: 65,
      idade_aposentadoria: 65,
    } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, {
        cliente: clienteIdadeInvalida,
        objetivos,
        assumptions: null,
      }),
    );

    expect(html).toContain("menor ou igual à idade atual");
    // Nada de veredito ou curva em cima de dado inconsistente.
    expect(html).not.toContain("Patrimônio se esgota aos");
    expect(html).not.toContain("Curva única do futuro financeiro");
  });

  // Mesmo caso de dado inválido na aba Simulações: sem anos de aposentadoria
  // o drawdown não roda e o veredito de sustentabilidade seria falso.
  it.each([
    ["igual à idade de aposentadoria", 65],
    ["menor que a idade de aposentadoria", 60],
  ])("não diz que o patrimônio sustenta quando a expectativa de vida é %s", (_caso, expectativaVida) => {
    const clienteExpectativaInvalida = {
      ...cliente,
      idade: 40,
      idade_aposentadoria: 65,
      expectativa_vida: expectativaVida,
    } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(SimulacoesTab, {
        cliente: clienteExpectativaInvalida,
        objetivos,
        assumptions: null,
      }),
    );

    expect(html).toContain("menor ou igual à idade de aposentadoria");
    expect(html).not.toContain("sustenta");
    expect(html).not.toContain("Curva única do futuro financeiro");
    expect(html).not.toContain("Objetivo atingido");
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
