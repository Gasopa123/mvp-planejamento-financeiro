import { describe, expect, it } from "vitest";
import { calcularIdade } from "@/lib/idade";
import {
  pessoaSchema,
  pessoalStepSchema,
  planosFuturosSchema,
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
  rendaMensal: 10000,
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
