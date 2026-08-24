import { describe, expect, it } from "vitest";
import { calcularTotaisRenda } from "./rendas";

describe("calcularTotaisRenda", () => {
  it("soma salário líquido e rendas recorrentes em totais mensal e anual", () => {
    expect(
      calcularTotaisRenda(5000, [
        { descricao: "Aluguel", valor: 1200, frequencia: "mensal", terminoEm: null },
        { descricao: "Bônus", valor: 12000, frequencia: "anual", terminoEm: null },
        { descricao: "Freela quinzenal", valor: 500, frequencia: "quinzenal", terminoEm: null },
        { descricao: "Venda única", valor: 3000, frequencia: "unica", terminoEm: null },
      ]),
    ).toEqual({
      mensalRecorrente: 8283.33,
      anualEstimado: 102400,
    });
  });
});
