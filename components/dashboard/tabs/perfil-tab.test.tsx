import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente, PessoaVinculada } from "@/lib/types/cliente";
import { PerfilTab } from "./perfil-tab";

const cliente = {
  id: "client-1",
  nome: "Cliente Teste",
  data_nascimento: "1990-01-01",
  idade: 36,
  profissao: "Engenheiro",
  estado_civil: "solteiro",
  e_clt: true,
  esporte_favorito: "Tênis",
  hobbies: "Leitura",
  peso_kg: null,
  altura_cm: null,
  possui_patologia: false,
  patologias: "",
  usa_medicamentos: false,
  medicamentos: "",
  fuma: false,
  anda_moto: false,
  frequencia_moto: "",
} as Cliente;

const conjuge = {
  id: "pessoa-1",
  client_id: "client-1",
  nome: "Cônjuge Teste",
  data_nascimento: "1992-01-01",
  dependente: true,
} as PessoaVinculada;

describe("PerfilTab", () => {
  it("deixa edição sob demanda nas categorias mutáveis", () => {
    const html = renderToStaticMarkup(
      createElement(PerfilTab, { cliente, conjuge, filhos: [conjuge] }),
    );

    expect(html).not.toContain("Alterar dados pessoais");
    expect(html).toContain("Dados pessoais");
    expect(html).toContain("Saúde e risco");
    expect(html).toContain("Cônjuge");
    expect(html).toContain("Filhos");
    expect(html.match(/<summary/g)?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(html).toContain('name="nome"');
    expect(html).toContain('name="peso_kg"');
    expect(html).toContain("Remover cônjuge");
    expect(html).toContain("Adicionar filho");
    expect(html).toContain('name="tabela" value="children"');
  });
});
