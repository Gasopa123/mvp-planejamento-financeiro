import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  StepFinanceiro,
  deveAlertarDespesaMaiorQueRenda,
  taxaPoupancaLabel,
} from "./step-financeiro";

describe("taxaPoupancaLabel", () => {
  it("retorna 'Não aplicável' quando a renda mensal é zero (capacidade/renda indefinida)", () => {
    expect(taxaPoupancaLabel(0, 0)).toBe("Não aplicável");
    expect(taxaPoupancaLabel(0, 1000)).toBe("Não aplicável");
  });

  it("calcula a taxa de poupança normalmente quando a renda é positiva", () => {
    expect(taxaPoupancaLabel(1000, 700)).toBe("30,0%");
  });
});

describe("deveAlertarDespesaMaiorQueRenda", () => {
  it("só alerta quando a despesa mensal supera a renda mensal", () => {
    expect(deveAlertarDespesaMaiorQueRenda(1000, 1000)).toBe(false);
    expect(deveAlertarDespesaMaiorQueRenda(1000, 999)).toBe(false);
    expect(deveAlertarDespesaMaiorQueRenda(1000, 1001)).toBe(true);
  });

  it("renderiza o aviso acessível quando a despesa supera a renda", () => {
    const html = renderToStaticMarkup(
      createElement(StepFinanceiro, {
        rendaMensal: 1000,
        despesaMensal: 1001,
        patrimonioInvestido: 0,
        errors: {},
        onRendaMensalChange: () => {},
        onDespesaMensalChange: () => {},
        onPatrimonioInvestidoChange: () => {},
      }),
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Atenção: a despesa mensal é maior que a renda mensal.");
  });
});
