import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClientDashboard } from "./client-dashboard";

const cliente = {
  id: "client-1",
  advisor_id: "advisor-1",
  nome: "Cliente Teste",
  data_nascimento: "1990-01-01",
  idade: 36,
  profissao: "Engenheiro",
  estado_civil: "solteiro",
  esporte_favorito: "Tênis",
  hobbies: "Leitura",
  salario_liquido: 8000,
  outras_rendas: [],
  renda_mensal: 10000,
  despesa_mensal_base: 4000,
  despesas_temporarias: [],
  despesa_mensal: 5000,
  patrimonio_investido: 100000,
  local_aplicado: "XP",
  tem_investimento_exterior: true,
  valor_investimento_exterior: 25000,
  tem_participacao_societaria: true,
  valor_participacao: 200000,
  percentual_participacao: 35,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  pretensao_salarial_aposentadoria: 15000,
  pretende_adquirir_bens: false,
  e_clt: true,
  tem_seguro_vida: false,
  peso_kg: null,
  altura_cm: null,
  possui_patologia: false,
  patologias: "",
  usa_medicamentos: false,
  medicamentos: "",
  fuma: false,
  anda_moto: false,
  frequencia_moto: "",
  criado_em: "2026-08-24",
  atualizado_em: "2026-08-24",
};

describe("ClientDashboard", () => {
  it("renderiza dashboard em página única com menu de âncoras", () => {
    const html = renderToStaticMarkup(
      createElement(ClientDashboard, {
        cliente,
        conjuge: null,
        filhos: [],
        imoveis: [],
        automoveis: [],
        objetivos: [],
        assumptions: null,
      }),
    );

    expect(html).toContain('href="#perfil"');
    expect(html).toContain('id="perfil"');
    expect(html).toContain('id="diagnostico"');
    expect(html).toContain('id="patrimonio"');
    expect(html.indexOf('id="aposentadoria"')).toBeLessThan(html.indexOf('id="objetivos"'));
    expect(html).toContain('id="simulacoes"');
    expect(html).toContain('href="/carteira/client-1/apresentacao"');
  });

  // A ordem pedida pelo assessor: aposentadoria, objetivos e simulações vêm
  // antes de patrimônio. Navegação e seções têm que bater — se uma delas for
  // reordenada sozinha, as âncoras passam a pular a página fora de ordem.
  const ORDEM_ESPERADA = [
    "perfil",
    "diagnostico",
    "aposentadoria",
    "objetivos",
    "simulacoes",
    "patrimonio",
    "plano-acao",
  ];

  function renderDashboard(): string {
    return renderToStaticMarkup(
      createElement(ClientDashboard, {
        cliente,
        conjuge: null,
        filhos: [],
        imoveis: [],
        automoveis: [],
        objetivos: [],
        assumptions: null,
      }),
    );
  }

  it("mostra as seções na ordem pedida, com patrimônio depois de simulações", () => {
    const html = renderDashboard();

    const posicoes = ORDEM_ESPERADA.map((id) => html.indexOf(`id="${id}"`));
    expect(posicoes.every((p) => p >= 0)).toBe(true);
    expect(posicoes).toEqual([...posicoes].sort((a, b) => a - b));
  });

  it("mantém o menu de âncoras na mesma ordem das seções", () => {
    const html = renderDashboard();

    const ancoras = [...html.matchAll(/href="#([a-z-]+)"/g)].map((m) => m[1]);
    expect(ancoras).toEqual(ORDEM_ESPERADA);
  });
});
