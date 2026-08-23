import type { ZodError } from "zod";
import {
  pessoalStepSchema,
  estiloVidaSchema,
  financeiroSchema,
  patrimonioSchema,
  objetivosSchema,
  societarioSchema,
  aposentadoriaSchema,
  planosFuturosSchema,
} from "./schema";
import type { StepId, WizardDraft } from "./types";

// Mensagens de erro indexadas pelo path do campo (ex: "nome",
// "0.nome" pro primeiro item de uma lista, "imoveis.0.valor" etc).
export type StepErrors = Record<string, string>;

function flatten(error: ZodError): StepErrors {
  const errors: StepErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

// Extrai o sub-conjunto de erros de um campo aninhado (ex: "imoveis.0.valor"
// -> "0.valor"), pra repassar só o que interessa a uma lista aninhada.
export function scopeErrors(errors: StepErrors, prefix: string): StepErrors {
  const scoped: StepErrors = {};
  const prefixWithDot = `${prefix}.`;
  for (const [key, message] of Object.entries(errors)) {
    if (key.startsWith(prefixWithDot)) {
      scoped[key.slice(prefixWithDot.length)] = message;
    }
  }
  return scoped;
}

export function validateStep(stepId: StepId, data: WizardDraft): StepErrors {
  switch (stepId) {
    case "pessoal": {
      const result = pessoalStepSchema.safeParse({
        nome: data.nome,
        dataNascimento: data.dataNascimento,
        idade: data.idade,
        profissao: data.profissao,
        eClt: data.eClt,
        estadoCivil: data.estadoCivil,
        conjuge: data.conjuge,
        filhos: data.filhos,
      });
      return result.success ? {} : flatten(result.error);
    }

    case "estilo-vida": {
      const result = estiloVidaSchema.safeParse({
        esporteFavorito: data.esporteFavorito,
        hobbies: data.hobbies,
      });
      return result.success ? {} : flatten(result.error);
    }

    case "financeiro": {
      const result = financeiroSchema.safeParse({
        rendaMensal: data.rendaMensal,
        despesaMensal: data.despesaMensal,
        patrimonioInvestido: data.patrimonioInvestido,
      });
      return result.success ? {} : flatten(result.error);
    }

    case "patrimonio": {
      const result = patrimonioSchema.safeParse({
        imoveis: data.imoveis,
        automoveis: data.automoveis,
      });
      return result.success ? {} : flatten(result.error);
    }

    case "objetivos": {
      const result = objetivosSchema.safeParse(data.objetivos);
      return result.success ? {} : flatten(result.error);
    }

    case "societario": {
      const result = societarioSchema.safeParse({
        temParticipacaoSocietaria: data.temParticipacaoSocietaria,
        valorParticipacao: data.valorParticipacao,
      });
      return result.success ? {} : flatten(result.error);
    }

    case "aposentadoria": {
      const result = aposentadoriaSchema.safeParse({
        idadeAposentadoria: data.idadeAposentadoria,
        expectativaVida: data.expectativaVida,
        pretensaoSalarialAposentadoria: data.pretensaoSalarialAposentadoria,
      });
      return result.success ? {} : flatten(result.error);
    }

    case "planos-futuros": {
      const result = planosFuturosSchema.safeParse({
        pretendeAdquirirBens: data.pretendeAdquirirBens,
        temSeguroVida: data.temSeguroVida,
      });
      return result.success ? {} : flatten(result.error);
    }
  }
}
