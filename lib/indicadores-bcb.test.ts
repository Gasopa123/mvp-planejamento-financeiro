import { describe, expect, it } from "vitest";
import {
  BCB_SERIES,
  anualizarCdiDiario,
  anualizarIpcaMensal,
  bcbSerieUrl,
} from "./indicadores-bcb";

describe("indicadores Banco Central", () => {
  it("usa séries públicas SGS para IPCA e CDI", () => {
    expect(BCB_SERIES.ipca).toBe(433);
    expect(BCB_SERIES.cdi).toBe(12);
    expect(bcbSerieUrl(12)).toContain("bcdata.sgs.12/dados/ultimos/1");
  });

  it("converte CDI diário e IPCA mensal para taxa anual", () => {
    expect(anualizarCdiDiario(0.05166)).toBeCloseTo(13.9, 1);
    expect(anualizarIpcaMensal(0.07)).toBeCloseTo(0.84, 2);
  });
});
