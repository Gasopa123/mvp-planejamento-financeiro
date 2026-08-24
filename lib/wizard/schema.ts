import { z } from "zod";
import { FREQUENCIA_DESPESA_OPTIONS } from "./despesas";
import { FREQUENCIA_RENDA_OPTIONS } from "./rendas";

export const ESTADO_CIVIL_OPTIONS = [
  "solteiro",
  "casado",
  "uniao_estavel",
  "divorciado",
  "viuvo",
] as const;

export const PRAZO_OPTIONS = ["curto", "medio", "longo"] as const;

// Opções fechadas de frequência de uso de moto — campo simples (select) em
// vez de texto livre, pra reduzir erro de preenchimento e manter os dados
// consistentes no dashboard (ver StepPessoal, subtópico "Saúde e risco").
export const FREQUENCIA_MOTO_OPTIONS = [
  "Diariamente",
  "Algumas vezes por semana",
  "Raramente",
  "Apenas em lazer/finais de semana",
] as const;

export type EstadoCivil = (typeof ESTADO_CIVIL_OPTIONS)[number];
export type Prazo = (typeof PRAZO_OPTIONS)[number];

// Estados civis que fazem a etapa "Cônjuge" aparecer no wizard.
export const ESTADOS_CIVIS_COM_CONJUGE: EstadoCivil[] = [
  "casado",
  "uniao_estavel",
];

// Rótulos legíveis, reaproveitados pelo wizard e pelo dashboard do cliente.
export const ESTADO_CIVIL_LABELS: Record<EstadoCivil, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  uniao_estavel: "União estável",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
};

export const PRAZO_LABELS: Record<Prazo, string> = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
};

const nomeSchema = z.string().trim().min(1, "Informe o nome.");
const profissaoSchema = z.string().trim().min(1, "Informe a profissão.");
const dataNascimentoObrigatoriaSchema = z
  .string()
  .trim()
  .min(1, "Informe a data de nascimento.");
const dataNascimentoSchema = z.string().nullable();

function valorMonetarioSchema(mensagem: string) {
  return z.number({ error: mensagem }).min(0, mensagem);
}

export const rendaExtraSchema = z.object({
  descricao: z.string().trim().min(1, "Descreva a renda."),
  valor: valorMonetarioSchema("Informe o valor da renda."),
  frequencia: z.enum(FREQUENCIA_RENDA_OPTIONS, {
    error: "Selecione a frequência.",
  }),
  terminoEm: z.string().nullable(),
});

export const despesaTemporariaSchema = z.object({
  descricao: z.string().trim().min(1, "Descreva a despesa."),
  valor: valorMonetarioSchema("Informe o valor da despesa."),
  frequencia: z.enum(FREQUENCIA_DESPESA_OPTIONS, {
    error: "Selecione a frequência.",
  }),
  terminoEm: z.string().nullable(),
});

// Checa os três campos condicionais de saúde e risco (patologias,
// medicamentos, frequência de moto), cada um exigido só quando o booleano
// correspondente é verdadeiro. Compartilhado entre pessoalStepSchema e
// wizardFormSchema pra não duplicar a regra em dois superRefine.
function refineSaudeRisco(
  data: {
    possuiPatologia: boolean;
    patologias: string;
    usaMedicamentos: boolean;
    medicamentos: string;
    andaMoto: boolean;
    frequenciaMoto: string;
  },
  ctx: z.RefinementCtx,
) {
  if (data.possuiPatologia && !data.patologias.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe as patologias.",
      path: ["patologias"],
    });
  }
  if (data.usaMedicamentos && !data.medicamentos.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe os medicamentos.",
      path: ["medicamentos"],
    });
  }
  if (data.andaMoto && !data.frequenciaMoto.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe a frequência que anda de moto.",
      path: ["frequenciaMoto"],
    });
  }
}

// ----------------------------------------------------------------------------
// Schemas por etapa — usados pra validar cada etapa do wizard isoladamente
// antes de liberar o avanço ("Próxima").
// ----------------------------------------------------------------------------

export const pessoaSchema = z.object({
  nome: nomeSchema,
  dataNascimento: dataNascimentoObrigatoriaSchema,
  idade: z
    .number({ error: "Informe a idade." })
    .int()
    .min(0)
    .max(130),
  profissao: profissaoSchema,
  eClt: z.boolean(),
  estadoCivil: z.enum(ESTADO_CIVIL_OPTIONS, {
    error: "Selecione o estado civil.",
  }),
});

export const conjugeSchema = z.object({
  nome: nomeSchema,
  dataNascimento: dataNascimentoSchema,
  dependente: z.boolean(),
});

export const filhoSchema = z.object({
  nome: nomeSchema,
  dataNascimento: dataNascimentoSchema,
  dependente: z.boolean(),
});

export const filhosSchema = z.array(filhoSchema);

// Subtópico "Saúde e risco" — peso/altura são numéricos opcionais (>= 0);
// patologias, medicamentos e frequência de moto só são exigidos quando o
// booleano correspondente é verdadeiro (ver refineSaudeRisco).
export const saudeRiscoSchema = z
  .object({
    pesoKg: z.number().min(0, "Peso inválido.").nullable(),
    alturaCm: z.number().int().min(0, "Altura inválida.").nullable(),
    possuiPatologia: z.boolean(),
    patologias: z.string().trim(),
    usaMedicamentos: z.boolean(),
    medicamentos: z.string().trim(),
    fuma: z.boolean(),
    andaMoto: z.boolean(),
    frequenciaMoto: z.string().trim(),
  })
  .superRefine(refineSaudeRisco);

// Etapa "Dados pessoais" — titular + subtópicos cônjuge (condicional ao
// estado civil), filhos (lista opcional), estilo de vida e saúde e risco,
// todos validados juntos porque hoje vivem na mesma etapa do wizard.
export const pessoalStepSchema = z
  .object({
    nome: nomeSchema,
    dataNascimento: dataNascimentoObrigatoriaSchema,
    idade: z
      .number({ error: "Informe a idade." })
      .int()
      .min(0)
      .max(130),
    profissao: profissaoSchema,
    eClt: z.boolean(),
    estadoCivil: z.enum(ESTADO_CIVIL_OPTIONS, {
      error: "Selecione o estado civil.",
    }),
    conjuge: conjugeSchema.nullable(),
    filhos: filhosSchema,
    esporteFavorito: z.string().trim(),
    hobbies: z.string().trim(),
    temSeguroVida: z.boolean(),
    pesoKg: z.number().min(0, "Peso inválido.").nullable(),
    alturaCm: z.number().int().min(0, "Altura inválida.").nullable(),
    possuiPatologia: z.boolean(),
    patologias: z.string().trim(),
    usaMedicamentos: z.boolean(),
    medicamentos: z.string().trim(),
    fuma: z.boolean(),
    andaMoto: z.boolean(),
    frequenciaMoto: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (
      ESTADOS_CIVIS_COM_CONJUGE.includes(data.estadoCivil) &&
      !data.conjuge
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe os dados do cônjuge.",
        path: ["conjuge"],
      });
    }
    refineSaudeRisco(data, ctx);
  });

export const financeiroSchema = z.object({
  salarioLiquido: valorMonetarioSchema("Informe o salário líquido."),
  outrasRendas: z.array(rendaExtraSchema),
  rendaMensal: valorMonetarioSchema("Informe a renda mensal."),
  despesaMensalBase: valorMonetarioSchema("Informe a despesa mensal fixa."),
  despesasTemporarias: z.array(despesaTemporariaSchema),
  despesaMensal: valorMonetarioSchema("Informe a despesa mensal."),
  patrimonioInvestido: valorMonetarioSchema("Informe o patrimônio investido."),
});

export const imovelSchema = z.object({
  valor: valorMonetarioSchema("Informe o valor do imóvel."),
  financiado: z.boolean(),
  adquiridoAposCasamento: z.boolean(),
});

export const automovelSchema = z.object({
  valor: valorMonetarioSchema("Informe o valor do automóvel."),
  financiado: z.boolean(),
  adquiridoAposCasamento: z.boolean(),
});

export const patrimonioSchema = z.object({
  imoveis: z.array(imovelSchema),
  automoveis: z.array(automovelSchema),
});

export const objetivoSchema = z.object({
  prazo: z.enum(PRAZO_OPTIONS, {
    error: "Selecione o prazo.",
  }),
  descricao: z.string().trim().min(1, "Descreva o objetivo."),
  valorEstimado: z.number().min(0).nullable(),
  horizonteAnos: z.number().int().min(0).nullable(),
});

export const objetivosSchema = z.array(objetivoSchema);

export const societarioSchema = z
  .object({
    temParticipacaoSocietaria: z.boolean(),
    valorParticipacao: z.number().min(0).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.temParticipacaoSocietaria && data.valorParticipacao == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o valor aproximado da participação.",
        path: ["valorParticipacao"],
      });
    }
  });

export const aposentadoriaSchema = z.object({
  idadeAposentadoria: z
    .number({ error: "Informe a idade de aposentadoria." })
    .int()
    .min(0)
    .max(130),
  expectativaVida: z
    .number({ error: "Informe a expectativa de vida." })
    .int()
    .min(0)
    .max(130),
  pretensaoSalarialAposentadoria: valorMonetarioSchema(
    "Informe a pretensão salarial pós-aposentadoria.",
  ),
});

export const planosFuturosSchema = z.object({
  pretendeAdquirirBens: z.boolean(),
});

// ----------------------------------------------------------------------------
// Schema completo — validado de novo antes do submit final (client) e
// revalidado na Server Action (defesa em profundidade).
// ----------------------------------------------------------------------------

export const wizardFormSchema = z
  .object({
    nome: nomeSchema,
    dataNascimento: dataNascimentoObrigatoriaSchema,
    idade: z
      .number({ error: "Informe a idade." })
      .int()
      .min(0)
      .max(130),
    profissao: profissaoSchema,
    eClt: z.boolean(),
    estadoCivil: z.enum(ESTADO_CIVIL_OPTIONS, {
      error: "Selecione o estado civil.",
    }),
    conjuge: conjugeSchema.nullable(),
    filhos: filhosSchema,
    esporteFavorito: z.string().trim(),
    hobbies: z.string().trim(),
    salarioLiquido: valorMonetarioSchema("Informe o salário líquido."),
    outrasRendas: z.array(rendaExtraSchema),
    rendaMensal: valorMonetarioSchema("Informe a renda mensal."),
    despesaMensalBase: valorMonetarioSchema("Informe a despesa mensal fixa."),
    despesasTemporarias: z.array(despesaTemporariaSchema),
    despesaMensal: valorMonetarioSchema("Informe a despesa mensal."),
    patrimonioInvestido: valorMonetarioSchema(
      "Informe o patrimônio investido.",
    ),
    imoveis: z.array(imovelSchema),
    automoveis: z.array(automovelSchema),
    objetivos: objetivosSchema,
    temParticipacaoSocietaria: z.boolean(),
    valorParticipacao: z.number().min(0).nullable(),
    idadeAposentadoria: z
      .number({ error: "Informe a idade de aposentadoria." })
      .int()
      .min(0)
      .max(130),
    expectativaVida: z
      .number({ error: "Informe a expectativa de vida." })
      .int()
      .min(0)
      .max(130),
    pretensaoSalarialAposentadoria: valorMonetarioSchema(
      "Informe a pretensão salarial pós-aposentadoria.",
    ),
    pretendeAdquirirBens: z.boolean(),
    temSeguroVida: z.boolean(),
    pesoKg: z.number().min(0, "Peso inválido.").nullable(),
    alturaCm: z.number().int().min(0, "Altura inválida.").nullable(),
    possuiPatologia: z.boolean(),
    patologias: z.string().trim(),
    usaMedicamentos: z.boolean(),
    medicamentos: z.string().trim(),
    fuma: z.boolean(),
    andaMoto: z.boolean(),
    frequenciaMoto: z.string().trim(),
  })
  .superRefine((data, ctx) => {
    if (
      ESTADOS_CIVIS_COM_CONJUGE.includes(data.estadoCivil) &&
      !data.conjuge
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe os dados do cônjuge.",
        path: ["conjuge"],
      });
    }
    if (data.temParticipacaoSocietaria && data.valorParticipacao == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o valor aproximado da participação.",
        path: ["valorParticipacao"],
      });
    }
    refineSaudeRisco(data, ctx);
  });

export type WizardFormData = z.infer<typeof wizardFormSchema>;
