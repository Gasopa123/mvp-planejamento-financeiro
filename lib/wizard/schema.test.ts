import { describe, expect, it } from "vitest";
import { calcularIdade } from "@/lib/idade";
import {
  financeiroSchema,
  pessoaSchema,
  pessoalStepSchema,
  planosFuturosSchema,
  saudeRiscoSchema,
  wizardFormSchema,
} from "./schema";

const hoje = new Date("2026-08-22T12:00:00Z");

const dadosBase = {
  nome: "Cliente Teste",
  dataNascimento: "1990-08-23",
  idade: calcularIdade("1990-08-23", hoje),
  profissao: "Engenheiro de Software",
  eClt: true,
  estadoCivil: "solteiro" as const,
  conjuge: null,
  filhos: [],
  esporteFavorito: "",
  hobbies: "",
  salarioLiquido: 8000,
  outrasRendas: [
    {
      descricao: "Aluguel",
      valor: 1200,
      frequencia: "mensal" as const,
      terminoEm: null,
    },
  ],
  rendaMensal: 10000,
  despesaMensalBase: 4000,
  despesasTemporarias: [
    {
      descricao: "Escola",
      valor: 1000,
      frequencia: "mensal" as const,
      terminoEm: "2027-12-31",
    },
  ],
  despesaMensal: 5000,
  patrimonioInvestido: 100000,
  imoveis: [],
  automoveis: [],
  objetivos: [],
  temParticipacaoSocietaria: false,
  valorParticipacao: null,
  idadeAposentadoria: 65,
  expectativaVida: 90,
  pretensaoSalarialAposentadoria: 15000,
  pretendeAdquirirBens: false,
  temSeguroVida: false,
  pesoKg: null,
  alturaCm: null,
  possuiPatologia: false,
  patologias: "",
  usaMedicamentos: false,
  medicamentos: "",
  fuma: false,
  andaMoto: false,
  frequenciaMoto: "",
};

describe("dados pessoais do wizard", () => {
  it("calcula a idade atual a partir da data de nascimento", () => {
    expect(calcularIdade("1990-08-22", hoje)).toBe(36);
    expect(calcularIdade("1990-08-23", hoje)).toBe(35);
  });

  it("valida dados pessoais com data de nascimento, profissão e CLT", () => {
    const result = pessoaSchema.safeParse({
      nome: dadosBase.nome,
      dataNascimento: dadosBase.dataNascimento,
      idade: dadosBase.idade,
      profissao: dadosBase.profissao,
      eClt: dadosBase.eClt,
      estadoCivil: dadosBase.estadoCivil,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      dataNascimento: "1990-08-23",
      profissao: "Engenheiro de Software",
      eClt: true,
    });
  });

  it("exige data de nascimento e profissão no schema completo", () => {
    const result = wizardFormSchema.safeParse(dadosBase);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      dataNascimento: "1990-08-23",
      profissao: "Engenheiro de Software",
      eClt: true,
    });
  });
});

describe("financeiro detalhado", () => {
  it("valida salário líquido e lista de outras rendas", () => {
    const result = financeiroSchema.safeParse({
      salarioLiquido: 8000,
      outrasRendas: [
        {
          descricao: "Aluguel",
          valor: 1200,
          frequencia: "mensal",
          terminoEm: null,
        },
      ],
      rendaMensal: 9200,
      despesaMensalBase: 4000,
      despesasTemporarias: [
        {
          descricao: "Escola",
          valor: 1000,
          frequencia: "mensal",
          terminoEm: "2027-12-31",
        },
      ],
      despesaMensal: 5000,
      patrimonioInvestido: 100000,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      salarioLiquido: 8000,
      outrasRendas: [{ descricao: "Aluguel", frequencia: "mensal" }],
      rendaMensal: 9200,
      despesasTemporarias: [{ descricao: "Escola", frequencia: "mensal" }],
    });
  });
});

describe("estilo de vida como subtópico de dados pessoais", () => {
  it("valida esporte favorito, hobbies e seguro de vida junto da etapa 'pessoal'", () => {
    const result = pessoalStepSchema.safeParse({
      nome: dadosBase.nome,
      dataNascimento: dadosBase.dataNascimento,
      idade: dadosBase.idade,
      profissao: dadosBase.profissao,
      eClt: dadosBase.eClt,
      estadoCivil: dadosBase.estadoCivil,
      conjuge: dadosBase.conjuge,
      filhos: dadosBase.filhos,
      esporteFavorito: "Corrida",
      hobbies: "Leitura",
      temSeguroVida: true,
      pesoKg: dadosBase.pesoKg,
      alturaCm: dadosBase.alturaCm,
      possuiPatologia: dadosBase.possuiPatologia,
      patologias: dadosBase.patologias,
      usaMedicamentos: dadosBase.usaMedicamentos,
      medicamentos: dadosBase.medicamentos,
      fuma: dadosBase.fuma,
      andaMoto: dadosBase.andaMoto,
      frequenciaMoto: dadosBase.frequenciaMoto,
    });

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      esporteFavorito: "Corrida",
      hobbies: "Leitura",
      temSeguroVida: true,
    });
  });

  it("não inclui mais 'Tem seguro de vida?' na etapa 'planos futuros'", () => {
    expect(Object.keys(planosFuturosSchema.shape)).toEqual([
      "pretendeAdquirirBens",
    ]);
  });
});

describe("saúde e risco como subtópico de dados pessoais", () => {
  it("valida peso, altura e os booleanos de risco sem exigir os campos condicionais quando falsos", () => {
    const result = saudeRiscoSchema.safeParse({
      pesoKg: 78.5,
      alturaCm: 178,
      possuiPatologia: false,
      patologias: "",
      usaMedicamentos: false,
      medicamentos: "",
      fuma: false,
      andaMoto: false,
      frequenciaMoto: "",
    });

    expect(result.success).toBe(true);
  });

  it("aceita peso e altura nulos (campos opcionais)", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      pesoKg: null,
      alturaCm: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejeita peso negativo", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      pesoKg: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejeita altura negativa", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      alturaCm: -1,
    });

    expect(result.success).toBe(false);
  });

  it("exige patologias quando possuiPatologia é verdadeiro", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      possuiPatologia: true,
      patologias: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join(".") === "patologias",
      );
      expect(issue).toBeDefined();
    }
  });

  it("passa quando possuiPatologia é verdadeiro e patologias está preenchido", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      possuiPatologia: true,
      patologias: "Hipertensão",
    });

    expect(result.success).toBe(true);
  });

  it("exige medicamentos quando usaMedicamentos é verdadeiro", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      usaMedicamentos: true,
      medicamentos: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join(".") === "medicamentos",
      );
      expect(issue).toBeDefined();
    }
  });

  it("exige frequenciaMoto quando andaMoto é verdadeiro", () => {
    const result = saudeRiscoSchema.safeParse({
      ...dadosBase,
      andaMoto: true,
      frequenciaMoto: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join(".") === "frequenciaMoto",
      );
      expect(issue).toBeDefined();
    }
  });

  it("valida os campos de saúde e risco junto da etapa 'pessoal'", () => {
    const result = pessoalStepSchema.safeParse({
      nome: dadosBase.nome,
      dataNascimento: dadosBase.dataNascimento,
      idade: dadosBase.idade,
      profissao: dadosBase.profissao,
      eClt: dadosBase.eClt,
      estadoCivil: dadosBase.estadoCivil,
      conjuge: dadosBase.conjuge,
      filhos: dadosBase.filhos,
      esporteFavorito: dadosBase.esporteFavorito,
      hobbies: dadosBase.hobbies,
      temSeguroVida: dadosBase.temSeguroVida,
      pesoKg: 78.5,
      alturaCm: 178,
      possuiPatologia: true,
      patologias: "",
      usaMedicamentos: false,
      medicamentos: "",
      fuma: false,
      andaMoto: false,
      frequenciaMoto: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join(".") === "patologias",
      );
      expect(issue).toBeDefined();
    }
  });

  it("valida o schema completo do wizard com os campos de saúde e risco", () => {
    const result = wizardFormSchema.safeParse({
      ...dadosBase,
      andaMoto: true,
      frequenciaMoto: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find(
        (i) => i.path.join(".") === "frequenciaMoto",
      );
      expect(issue).toBeDefined();
    }
  });
});
