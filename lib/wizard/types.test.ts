import { describe, expect, it } from "vitest";
import { WIZARD_STEPS } from "./types";

describe("WIZARD_STEPS", () => {
  it("não exibe mais etapas separadas para Cônjuge e Filhos", () => {
    const ids = WIZARD_STEPS.map((step) => step.id);
    expect(ids).not.toContain("conjuge");
    expect(ids).not.toContain("filhos");
  });

  it("não exibe mais uma etapa separada para Estilo de vida", () => {
    const ids = WIZARD_STEPS.map((step) => step.id);
    expect(ids).not.toContain("estilo-vida");
  });

  it("mantém Dados pessoais como a primeira etapa", () => {
    expect(WIZARD_STEPS[0]).toMatchObject({
      id: "pessoal",
      label: "Dados pessoais",
    });
  });

  // Ordem pedida pelo assessor: Dados pessoais -> Aposentadoria e objetivos
  // -> Financeiro -> Planos futuros. Aposentadoria vem antes de Financeiro e
  // é o assunto principal da etapa; objetivos entram como complemento dela.
  it("segue exatamente as 4 etapas, na ordem pedida", () => {
    expect(WIZARD_STEPS).toEqual([
      { id: "pessoal", label: "Dados pessoais" },
      { id: "aposentadoria-objetivos", label: "Aposentadoria e objetivos" },
      { id: "financeiro", label: "Financeiro" },
      { id: "planos-futuros", label: "Planos futuros" },
    ]);
  });

  it("não expõe mais Patrimônio, Objetivos e Participação societária como etapas próprias", () => {
    const ids = WIZARD_STEPS.map((step) => step.id);

    expect(ids).not.toContain("patrimonio");
    expect(ids).not.toContain("objetivos");
    expect(ids).not.toContain("societario");
    expect(ids).not.toContain("aposentadoria");
  });
});
