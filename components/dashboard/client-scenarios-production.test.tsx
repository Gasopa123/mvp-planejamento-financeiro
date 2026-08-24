import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClientDashboard } from "./client-dashboard";
import { PresentationDashboard } from "./presentation-dashboard";
import type { Cliente, Objetivo, PessoaVinculada, Propriedade } from "@/lib/types/cliente";

const baseCliente: Cliente = {
  id: "cliente-base",
  advisor_id: "advisor-1",
  nome: "Cliente Base",
  idade: 40,
  data_nascimento: "1986-01-01",
  profissao: "Empresário",
  estado_civil: "casado",
  esporte_favorito: "Corrida",
  hobbies: "Família",
  salario_liquido: 20000,
  outras_rendas: [],
  renda_mensal: 25000,
  despesa_mensal_base: 12000,
  despesas_temporarias: [],
  despesa_mensal: 14000,
  patrimonio_investido: 400000,
  local_aplicado: "XP",
  tem_investimento_exterior: false,
  valor_investimento_exterior: null,
  tem_participacao_societaria: false,
  valor_participacao: null,
  percentual_participacao: null,
  idade_aposentadoria: 65,
  expectativa_vida: 90,
  pretensao_salarial_aposentadoria: 18000,
  pretende_adquirir_bens: false,
  e_clt: false,
  tem_seguro_vida: true,
  peso_kg: 80,
  altura_cm: 178,
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

const cenarios: { nome: string; cliente: Cliente; objetivos: Objetivo[]; conjuge: PessoaVinculada | null; filhos: PessoaVinculada[] }[] = [
  {
    nome: "cliente equilibrado com família e objetivo médio",
    cliente: baseCliente,
    conjuge: { id: "spouse-1", client_id: baseCliente.id, nome: "Cônjuge", data_nascimento: "1988-01-01", dependente: true },
    filhos: [{ id: "child-1", client_id: baseCliente.id, nome: "Filho", data_nascimento: "2020-01-01", dependente: true }],
    objetivos: [{ id: "goal-1", client_id: baseCliente.id, descricao: "Comprar imóvel", prazo: "medio", valor_estimado: 300000, horizonte_anos: 7 }],
  },
  {
    nome: "cliente com caixa apertado e objetivos caros",
    cliente: { ...baseCliente, id: "cliente-apertado", nome: "Cliente Apertado", renda_mensal: 9000, despesa_mensal: 11000, patrimonio_investido: 50000, pretensao_salarial_aposentadoria: 7000 },
    conjuge: null,
    filhos: [],
    objetivos: [{ id: "goal-2", client_id: "cliente-apertado", descricao: "Intercâmbio", prazo: "curto", valor_estimado: 80000, horizonte_anos: 2 }],
  },
  {
    nome: "cliente já aposentando sem objetivos",
    cliente: { ...baseCliente, id: "cliente-aposentando", nome: "Cliente Aposentando", idade: 66, idade_aposentadoria: 65, renda_mensal: 12000, despesa_mensal: 9000, patrimonio_investido: 1200000, pretensao_salarial_aposentadoria: 9000 },
    conjuge: null,
    filhos: [],
    objetivos: [],
  },
];

function renderCenario(cenario: (typeof cenarios)[number]) {
  const imoveis: Propriedade[] = [];
  const automoveis: Propriedade[] = [];
  return [
    renderToStaticMarkup(createElement(ClientDashboard, { ...cenario, imoveis, automoveis, assumptions: null })),
    renderToStaticMarkup(createElement(PresentationDashboard, { cliente: cenario.cliente, objetivos: cenario.objetivos, assumptions: null })),
  ].join("\n");
}

describe("cenários de produção", () => {
  it.each(cenarios)("renderiza sem valores quebrados: $nome", (cenario) => {
    const html = renderCenario(cenario);

    expect(html).not.toMatch(/NaN|Infinity|undefined/);
    expect(html).toContain("Diagnóstico");
    expect(html).toContain("Aposentadoria");
    expect(html).toContain("Simulações");
    expect(html).toContain("Apresentação do plano");
  });

  it("mantém apresentação alinhada com blocos principais do dashboard", () => {
    const html = renderToStaticMarkup(createElement(PresentationDashboard, { cliente: baseCliente, objetivos: cenarios[0].objetivos, assumptions: null }));

    for (const texto of ["Valor visual para o cliente", "Objetivos consomem capacidade", "Stress test", "Sem objetivos", "Comprar imóvel"]) {
      expect(html).toContain(texto);
    }
  });
});
