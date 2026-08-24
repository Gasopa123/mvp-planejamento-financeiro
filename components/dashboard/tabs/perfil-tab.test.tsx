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

describe("PerfilTab", () => {
  it("mostra formulário para alterar dados pessoais", () => {
    const html = renderToStaticMarkup(
      createElement(PerfilTab, { cliente, conjuge: null as PessoaVinculada | null, filhos: [] }),
    );

    expect(html).toContain("Alterar dados pessoais");
    expect(html).toContain('name="nome"');
    expect(html).toContain('name="profissao"');
    expect(html).toContain("Salvar dados pessoais");
  });
});
