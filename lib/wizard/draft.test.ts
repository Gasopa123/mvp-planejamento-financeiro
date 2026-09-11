import { describe, expect, it } from "vitest";
import { calcularIdade } from "../idade";
import {
  listaAposToggle,
  patchDeDataNascimento,
  patchDeDespesas,
  patchDeEstadoCivil,
  patchDeRendas,
} from "./draft";
import { criarPessoaVazia, criarWizardDraftInicial } from "./types";

describe("patchDeEstadoCivil", () => {
  it("descarta o cônjuge ao sair de um estado civil que tem cônjuge", () => {
    const draft = { ...criarWizardDraftInicial(), conjuge: criarPessoaVazia() };

    expect(patchDeEstadoCivil(draft, "solteiro").conjuge).toBeNull();
    expect(patchDeEstadoCivil(draft, "").conjuge).toBeNull();
  });

  it("preserva o cônjuge quando o estado civil continua tendo cônjuge", () => {
    const conjuge = criarPessoaVazia();
    const draft = { ...criarWizardDraftInicial(), conjuge };

    expect(patchDeEstadoCivil(draft, "casado").conjuge).toBe(conjuge);
  });
});

describe("patchDeDataNascimento", () => {
  it("deriva a idade da data informada e a zera quando a data sai", () => {
    expect(patchDeDataNascimento("1990-08-23")).toEqual({
      dataNascimento: "1990-08-23",
      idade: calcularIdade("1990-08-23"),
    });
    expect(patchDeDataNascimento("").idade).toBeNull();
  });
});

describe("patchDeRendas e patchDeDespesas", () => {
  it("reescrevem o total mensal recorrente junto com o campo editado", () => {
    const rendas = patchDeRendas(8000, [
      { descricao: "Aluguel", valor: 1200, frequencia: "mensal", terminoEm: "" },
    ]);
    expect(rendas.rendaMensal).toBe(9200);

    const despesas = patchDeDespesas(5000, [
      { descricao: "Escola", valor: 800, frequencia: "mensal", terminoEm: "" },
    ]);
    expect(despesas.despesaMensal).toBe(5800);
  });
});

describe("listaAposToggle", () => {
  it('esvazia a lista no "não" e semeia um item em branco no "sim"', () => {
    expect(listaAposToggle([], false)).toEqual([]);
    expect(listaAposToggle([], true)).toHaveLength(1);
  });

  it('devolve a mesma lista no "sim" quando já há itens, para o clique não ter efeito', () => {
    const lista = listaAposToggle([], true);

    expect(listaAposToggle(lista, true)).toBe(lista);
  });
});
