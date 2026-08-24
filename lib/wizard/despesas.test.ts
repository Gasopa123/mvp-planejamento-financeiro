import { describe, expect, it } from "vitest";
import { calcularTotaisDespesa } from "./despesas";

describe("calcularTotaisDespesa", () => {
  it("soma despesa mensal fixa e despesas temporárias por frequência", () => {
    expect(
      calcularTotaisDespesa(4000, [
        { descricao: "Escola", valor: 1000, frequencia: "mensal", terminoEm: "2027-12-31" },
        { descricao: "IPVA", valor: 2400, frequencia: "anual", terminoEm: null },
        { descricao: "Parcela quinzenal", valor: 300, frequencia: "quinzenal", terminoEm: null },
        { descricao: "Reforma", valor: 5000, frequencia: "unica", terminoEm: "2026-11-01" },
      ]),
    ).toEqual({
      mensalRecorrente: 5850,
      anualEstimado: 75200,
    });
  });
});
