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
    expect(html).toContain("Stress test");
    expect(html).toContain("Sem objetivos");
    expect(html).toContain("Comprar imóvel");
    expect(html).not.toContain("Alterar dados pessoais");
  });
});
