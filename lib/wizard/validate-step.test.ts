import { describe, expect, it } from "vitest";
import { calcularIdade } from "@/lib/idade";
import { criarPessoaVazia, criarWizardDraftInicial, type WizardDraft } from "./types";
import { validateStep } from "./validate-step";

function draftBase(): WizardDraft {
  return {
    ...criarWizardDraftInicial(),
    nome: "Cliente Teste",
    dataNascimento: "1990-08-23",
    idade: calcularIdade("1990-08-23", new Date("2026-08-22T12:00:00Z")),
    profissao: "Engenheiro de Software",
    eClt: true,
    estadoCivil: "solteiro",
  };
}

describe("validateStep('pessoal') — dados do titular", () => {
  it("acusa erro quando o nome do titular está vazio", () => {
    const draft = { ...draftBase(), nome: "" };
    const errors = validateStep("pessoal", draft);
    expect(errors.nome).toBeDefined();
  });

  it("não acusa erros quando os dados do titular (solteiro, sem filhos) estão completos", () => {
    const errors = validateStep("pessoal", draftBase());
    expect(errors).toEqual({});
  });
});

describe("validateStep('pessoal') — cônjuge condicional", () => {
  it("exige cônjuge quando o estado civil é casado", () => {
    const draft: WizardDraft = { ...draftBase(), estadoCivil: "casado", conjuge: null };
    const errors = validateStep("pessoal", draft);
    expect(errors.conjuge).toBeDefined();
  });

  it("exige cônjuge quando o estado civil é união estável", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      estadoCivil: "uniao_estavel",
      conjuge: null,
    };
    const errors = validateStep("pessoal", draft);
    expect(errors.conjuge).toBeDefined();
  });

  it("não exige cônjuge quando o estado civil é solteiro", () => {
    const draft: WizardDraft = { ...draftBase(), estadoCivil: "solteiro", conjuge: null };
    const errors = validateStep("pessoal", draft);
    expect(errors.conjuge).toBeUndefined();
  });

  it("acusa erro no nome do cônjuge quando ele está preenchido incompleto", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      estadoCivil: "casado",
      conjuge: { ...criarPessoaVazia(), nome: "" },
    };
    const errors = validateStep("pessoal", draft);
    expect(errors["conjuge.nome"]).toBeDefined();
  });

  it("passa quando o estado civil é casado e o cônjuge está completo", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      estadoCivil: "casado",
      conjuge: { nome: "Cônjuge Teste", dataNascimento: "1992-01-01", dependente: false },
    };
    const errors = validateStep("pessoal", draft);
    expect(errors).toEqual({});
  });
});

describe("validateStep('pessoal') — filhos opcionais", () => {
  it("não exige nenhum filho", () => {
    const draft: WizardDraft = { ...draftBase(), filhos: [] };
    const errors = validateStep("pessoal", draft);
    expect(errors).toEqual({});
  });

  it("acusa erro no filho cadastrado sem nome", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      filhos: [{ ...criarPessoaVazia(), nome: "" }],
    };
    const errors = validateStep("pessoal", draft);
    expect(errors["filhos.0.nome"]).toBeDefined();
  });

  it("passa quando os filhos cadastrados estão completos", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      filhos: [{ nome: "Filho Teste", dataNascimento: "2015-01-01", dependente: true }],
    };
    const errors = validateStep("pessoal", draft);
    expect(errors).toEqual({});
  });
});

describe("validateStep('pessoal') — estilo de vida (subtópico)", () => {
  it("passa quando esporte favorito, hobbies e seguro de vida estão preenchidos", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      esporteFavorito: "Corrida",
      hobbies: "Leitura",
      temSeguroVida: true,
    };
    const errors = validateStep("pessoal", draft);
    expect(errors).toEqual({});
  });
});

describe("validateStep('pessoal') — saúde e risco (subtópico)", () => {
  it("passa quando peso e altura estão preenchidos e nenhum condicional está ativo", () => {
    const draft: WizardDraft = { ...draftBase(), pesoKg: 78.5, alturaCm: 178 };
    const errors = validateStep("pessoal", draft);
    expect(errors).toEqual({});
  });

  it("acusa erro quando possuiPatologia é verdadeiro sem patologias preenchido", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      possuiPatologia: true,
      patologias: "",
    };
    const errors = validateStep("pessoal", draft);
    expect(errors.patologias).toBeDefined();
  });

  it("acusa erro quando usaMedicamentos é verdadeiro sem medicamentos preenchido", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      usaMedicamentos: true,
      medicamentos: "",
    };
    const errors = validateStep("pessoal", draft);
    expect(errors.medicamentos).toBeDefined();
  });

  it("acusa erro quando andaMoto é verdadeiro sem frequenciaMoto preenchido", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      andaMoto: true,
      frequenciaMoto: "",
    };
    const errors = validateStep("pessoal", draft);
    expect(errors.frequenciaMoto).toBeDefined();
  });

  it("passa quando os campos condicionais estão preenchidos", () => {
    const draft: WizardDraft = {
      ...draftBase(),
      possuiPatologia: true,
      patologias: "Hipertensão",
      usaMedicamentos: true,
      medicamentos: "Losartana",
      andaMoto: true,
      frequenciaMoto: "Diariamente",
    };
    const errors = validateStep("pessoal", draft);
    expect(errors).toEqual({});
  });
});

describe("validateStep('planos-futuros')", () => {
  it("não exige mais 'Tem seguro de vida?' — só pretende adquirir bens", () => {
    const draft: WizardDraft = { ...draftBase(), pretendeAdquirirBens: true };
    const errors = validateStep("planos-futuros", draft);
    expect(errors).toEqual({});
  });
});
