import type { ZodError } from "zod";
import {
  pessoalStepSchema,
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

// Junta os erros de vários safeParse independentes numa etapa que hoje
// agrupa mais de um schema (ex: "financeiro" cobre financeiro + patrimônio +
// participação societária). Os schemas envolvidos não têm campos com o
// mesmo nome, então não há risco de uma chave sobrescrever a outra.
function mergeStepErrors(
  ...results: { success: boolean; error?: ZodError }[]
): StepErrors {
  return results.reduce<StepErrors>(
    (errors, result) =>
      result.success ? errors : { ...errors, ...flatten(result.error!) },
    {},
  );
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
        esporteFavorito: data.esporteFavorito,
        hobbies: data.hobbies,
        temSeguroVida: data.temSeguroVida,
        pesoKg: data.pesoKg,
        alturaCm: data.alturaCm,
        possuiPatologia: data.possuiPatologia,
        patologias: data.patologias,
        usaMedicamentos: data.usaMedicamentos,
        medicamentos: data.medicamentos,
        fuma: data.fuma,
        andaMoto: data.andaMoto,
        frequenciaMoto: data.frequenciaMoto,
      });
      return result.success ? {} : flatten(result.error);
    }

    // Etapa "Financeiro" — hoje agrupa financeiro, patrimônio (imóveis e
    // automóveis) e participação societária (ver StepFinanceiro,
    // StepPatrimonio e StepSocietario dentro de ClientWizard).
    case "financeiro": {
      const financeiroResult = financeiroSchema.safeParse({
        salarioLiquido: data.salarioLiquido,
        outrasRendas: data.outrasRendas,
        rendaMensal: data.rendaMensal,
        despesaMensalBase: data.despesaMensalBase,
        despesasTemporarias: data.despesasTemporarias,
        despesaMensal: data.despesaMensal,
        patrimonioInvestido: data.patrimonioInvestido,
        localAplicado: data.localAplicado,
        temInvestimentoExterior: data.temInvestimentoExterior,
        valorInvestimentoExterior: data.valorInvestimentoExterior,
      });
      const patrimonioResult = patrimonioSchema.safeParse({
        imoveis: data.imoveis,
        automoveis: data.automoveis,
      });
      const societarioResult = societarioSchema.safeParse({
        temParticipacaoSocietaria: data.temParticipacaoSocietaria,
        valorParticipacao: data.valorParticipacao,
        percentualParticipacao: data.percentualParticipacao,
      });
      return mergeStepErrors(financeiroResult, patrimonioResult, societarioResult);
    }

    // Etapa "Aposentadoria e objetivos" — aposentadoria é o assunto
    // principal, objetivos é o subtópico complementar (ver StepAposentadoria
    // e StepObjetivos dentro de ClientWizard).
    case "aposentadoria-objetivos": {
      const aposentadoriaResult = aposentadoriaSchema.safeParse({
        idadeAposentadoria: data.idadeAposentadoria,
        expectativaVida: data.expectativaVida,
        pretensaoSalarialAposentadoria: data.pretensaoSalarialAposentadoria,
      });
      const objetivosResult = objetivosSchema.safeParse(data.objetivos);
      return mergeStepErrors(aposentadoriaResult, objetivosResult);
    }

    case "planos-futuros": {
      const result = planosFuturosSchema.safeParse({
        pretendeAdquirirBens: data.pretendeAdquirirBens,
      });
      return result.success ? {} : flatten(result.error);
    }
  }
}
