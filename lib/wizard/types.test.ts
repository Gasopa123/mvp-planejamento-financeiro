import { describe, expect, it } from "vitest";
import { WIZARD_STEPS } from "./types";

describe("WIZARD_STEPS", () => {
  it("não exibe mais etapas separadas para Cônjuge e Filhos", () => {
    const ids = WIZARD_STEPS.map((step) => step.id);
    expect(ids).not.toContain("conjuge");
    expect(ids).not.toContain("filhos");
  });

  it("mantém Dados pessoais como a primeira etapa", () => {
    expect(WIZARD_STEPS[0]).toMatchObject({
      id: "pessoal",
      label: "Dados pessoais",
    });
  });
});
