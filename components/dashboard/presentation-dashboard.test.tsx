import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PresentationDashboard } from "./presentation-dashboard";
import type { Cliente, Objetivo } from "@/lib/types/cliente";

const cliente: Cliente = {
  id: "client-1",
  advisor_id: "advisor-1",
  nome: "Cliente Teste",
  idade: 36,
  data_nascimento: "1990-01-01",
  profissao: null,
  estado_civil: null,
  esporte_favorito: null,
  hobbies: null,
  salario_liquido: 10000,
  outras_rendas: [],
  renda_mensal: 10000,
  despesa_mensal_base: 5000,
  despesas_temporarias: [],
  despesa_mensal: 5000,
  patrimonio_investido: 100000,
  local_aplicado: null,
  tem_investimento_exterior: false,
  valor_investimento_exterior: null,
  tem_participacao_societaria: false,
  valor_participacao: null,
  percentual_participacao: null,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  pretensao_salarial_aposentadoria: 15000,
  pretende_adquirir_bens: false,
  e_clt: true,
  tem_seguro_vida: false,
  peso_kg: null,
  altura_cm: null,
  possui_patologia: false,
  patologias: null,
  usa_medicamentos: false,
  medicamentos: null,
  fuma: false,
  anda_moto: false,
  frequencia_moto: null,
  criado_em: "2026-08-24",
  atualizado_em: "2026-08-24",
};

const objetivos: Objetivo[] = [{ id: "o1", client_id: "client-1", prazo: "medio", descricao: "Comprar imóvel", valor_estimado: 200000, horizonte_anos: 5 }];

describe("PresentationDashboard", () => {
  // Exportação: o root marcado é o que vira arquivo; Voltar e os botões ficam
  // num grupo marcado para sair do arquivo e da impressão.
  it("traz Exportar HTML e Exportar PDF fora do arquivo e da impressão", () => {
    const html = renderToStaticMarkup(
      createElement(PresentationDashboard, { cliente, objetivos, assumptions: null }),
    );

    expect(html).toMatch(/^<main data-export-root="" class="bg-canvas -m-6/);
    const grupo = html.match(/<div data-export-ignore="" class="([^"]*)">([\s\S]*?)<\/div><\/div>/);
    expect(grupo?.[1]).toContain("print:hidden");
    expect(grupo?.[1]).toContain("flex-wrap");
    expect(grupo?.[2]).toContain("Voltar ao dashboard");
    expect(grupo?.[2]).toMatch(/<button type="button"[^>]*>Exportar HTML<\/button>/);
    expect(grupo?.[2]).toMatch(/<button type="button"[^>]*>Exportar PDF<\/button>/);
  });

  it("renderiza narrativa de reunião sem abas de edição", () => {
    const html = renderToStaticMarkup(
      createElement(PresentationDashboard, {
        cliente,
        objetivos,
        assumptions: null,
      }),
    );

    expect(html).toContain("Apresentação do plano");
    expect(html).toContain("Diagnóstico executivo");
    expect(html).toContain("Valor visual para o cliente");
    expect(html).toContain("Objetivos — leitura alternativa (poupar mês a mês)");
    // O aporte da curva é a capacidade cheia: os objetivos já saem dela como
    // retirada no ano do horizonte, então não podem encolher o aporte também.
    expect(html).toContain("Capacidade de investimento");
    expect(html).toContain("não se somam");
    // Notas e resultado do stress test são conteúdo, não decoração: ink-60.
    expect(html).toContain('text-ink-60">Na curva os objetivos saem do patrimônio');
    expect(html).toMatch(/text-ink-60">(sustenta até|esgota aos) \d+</);
    expect(html).toContain("Stress test");
    expect(html).toContain("Sem objetivos");
    expect(html).toContain("Comprar imóvel");
    expect(html).not.toContain("Alterar dados pessoais");
    // Com dados válidos não aparece o aviso de projeção indisponível.
    expect(html).not.toContain("Projeção indisponível");
  });

  // B8: a apresentação mostra o mesmo stress test, então precisa da mesma
  // explicação do empate entre Base e "Inflação +2%".
  it("explica o empate do choque de inflação só quando falta objetivo com prazo", () => {
    const nota = "Sem objetivos futuros com prazo, o choque de inflação não altera esta projeção.";
    const render = (lista: Objetivo[]) =>
      renderToStaticMarkup(
        createElement(PresentationDashboard, { cliente, objetivos: lista, assumptions: null }),
      );

    expect(render([])).toContain(`text-ink-60">${nota}`);
    expect(render(objetivos)).not.toContain(nota);
  });

  // No tablet (768px) três colunas deixavam ~164px úteis no card navy e o valor
  // de 7 dígitos (~232px) invadia o card vizinho; cinco colunas no stress test
  // deixavam ~94px para ~110px de valor. Máximo de colunas só a partir de lg.
  it("só usa 3 colunas nos cards principais e 5 no stress test a partir de lg", () => {
    const html = renderToStaticMarkup(
      createElement(PresentationDashboard, { cliente, objetivos, assumptions: null }),
    );

    expect(html).toMatch(
      /<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"><div class="[^"]*bg-navy/,
    );
    expect(html).toMatch(
      /<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5"><div class="rounded-xl border border-line p-3"><span[^>]*>Base</,
    );
  });

  it("mostra o aviso de cenários comprometidos com contraste de conteúdo", () => {
    const clienteApertado = {
      ...cliente,
      idade: 30,
      idade_aposentadoria: 60,
      patrimonio_investido: 50000,
      despesa_mensal_base: 9500,
      despesa_mensal: 9500,
    };
    const objetivoImpagavel: Objetivo[] = [
      { id: "o2", client_id: "client-1", prazo: "medio", descricao: "Casa nova", valor_estimado: 5_000_000, horizonte_anos: 2 },
    ];

    const html = renderToStaticMarkup(
      createElement(PresentationDashboard, { cliente: clienteApertado, objetivos: objetivoImpagavel, assumptions: null }),
    );

    expect(html).toContain('text-ink-60">Todos os cenários comprometem o patrimônio');
    expect(html).toMatch(/text-ink-60">objetivos comprometem aos \d+</);
  });

  // Antes a apresentação só escondia curva e stress test, sem dizer por quê —
  // numa reunião com o cliente isso parece uma tela quebrada.
  it.each([
    ["idade de aposentadoria menor que a atual", { idade: 70, idade_aposentadoria: 65 }],
    ["expectativa de vida menor que a aposentadoria", { idade: 40, idade_aposentadoria: 65, expectativa_vida: 60 }],
    ["dados de idade ausentes", { idade: null, idade_aposentadoria: null, expectativa_vida: null }],
  ])("avisa que a projeção está indisponível quando %s", (_caso, patch) => {
    const clienteInvalido = { ...cliente, ...patch } as unknown as Cliente;

    const html = renderToStaticMarkup(
      createElement(PresentationDashboard, {
        cliente: clienteInvalido,
        objetivos,
        assumptions: null,
      }),
    );

    expect(html).toContain("Projeção indisponível");
    expect(html).not.toContain("Curva do futuro financeiro");
    expect(html).not.toContain("Stress test");
  });
});
