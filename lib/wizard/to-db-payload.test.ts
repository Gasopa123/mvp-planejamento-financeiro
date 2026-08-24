import { describe, expect, it } from "vitest";
import { calcularIdade } from "@/lib/idade";
import { wizardFormSchema } from "./schema";
import { toDbPayload } from "./to-db-payload";

const hoje = new Date("2026-08-22T12:00:00Z");

// Espelha o preenchimento real do wizard: titular solteiro, saúde e risco
// com peso/altura preenchidos e "anda de moto" = sim com frequência
// preenchida — exatamente o cenário do bug em produção (altura_cm e
// frequencia_moto chegando NULL no banco).
const dadosCompletos = {
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
  localAplicado: "XP",
  temInvestimentoExterior: true,
  valorInvestimentoExterior: 25000,
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
  pesoKg: 78.5,
  alturaCm: 178,
  possuiPatologia: false,
  patologias: "",
  usaMedicamentos: false,
  medicamentos: "",
  fuma: false,
  andaMoto: true,
  frequenciaMoto: "Diariamente",
};

describe("toDbPayload — regressão altura/frequência de moto NULL", () => {
  it("inclui altura_cm e frequencia_moto (snake_case) no payload de create_client_full", () => {
    const parsed = wizardFormSchema.parse(dadosCompletos);
    const payload = toDbPayload(parsed);

    expect(payload.altura_cm).toBe(178);
    expect(payload.frequencia_moto).toBe("Diariamente");
    expect(payload.anda_moto).toBe(true);
  });

  it("inclui salário líquido e outras rendas em snake_case", () => {
    const parsed = wizardFormSchema.parse(dadosCompletos);
    const payload = toDbPayload(parsed);

    expect(payload.salario_liquido).toBe(8000);
    expect(payload.outras_rendas).toEqual([
      {
        descricao: "Aluguel",
        valor: 1200,
        frequencia: "mensal",
        termino_em: null,
      },
    ]);
    expect(payload.despesa_mensal_base).toBe(4000);
    expect(payload.despesas_temporarias).toEqual([
      {
        descricao: "Escola",
        valor: 1000,
        frequencia: "mensal",
        termino_em: "2027-12-31",
      },
    ]);
    expect(payload.local_aplicado).toBe("XP");
    expect(payload.tem_investimento_exterior).toBe(true);
    expect(payload.valor_investimento_exterior).toBe(25000);
  });

  it("não faz altura_cm ou frequencia_moto virarem undefined quando os valores são válidos", () => {
    const parsed = wizardFormSchema.parse(dadosCompletos);
    const payload = toDbPayload(parsed);

    expect(payload.altura_cm).not.toBeUndefined();
    expect(payload.frequencia_moto).not.toBeUndefined();
    expect("altura_cm" in payload).toBe(true);
    expect("frequencia_moto" in payload).toBe(true);
  });

  it("mantém altura_cm e frequencia_moto nulos/vazios quando não preenchidos e andaMoto é falso", () => {
    const parsed = wizardFormSchema.parse({
      ...dadosCompletos,
      alturaCm: null,
      andaMoto: false,
      frequenciaMoto: "",
    });
    const payload = toDbPayload(parsed);

    expect(payload.altura_cm).toBeNull();
    expect(payload.anda_moto).toBe(false);
    expect(payload.frequencia_moto).toBe("");
  });

  it("mapeia todo o payload para snake_case, sem sobrar campos em camelCase", () => {
    const parsed = wizardFormSchema.parse(dadosCompletos);
    const payload = toDbPayload(parsed);

    for (const key of Object.keys(payload)) {
      expect(key).toBe(key.toLowerCase());
    }
  });
});
