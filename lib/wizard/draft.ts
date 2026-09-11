// Transformações puras do rascunho do wizard.
//
// Cada função recebe o que o advisor mexeu e devolve o pedaço do rascunho
// que muda por causa disso — sem estado de React, sem setState. O componente
// continua dono de quando aplicar; aqui fica a regra de o que muda junto.

import { calcularIdade } from "../idade";
import { calcularTotaisDespesa, type DespesaTemporaria } from "./despesas";
import { calcularTotaisRenda, type RendaExtra } from "./rendas";
import { ESTADOS_CIVIS_COM_CONJUGE, type EstadoCivil } from "./schema";
import { criarPropriedadeVazia, type PropriedadeDraft, type WizardDraft } from "./types";

/** Sair de um estado civil com cônjuge descarta o cônjuge preenchido. */
export function patchDeEstadoCivil(
  draft: WizardDraft,
  estadoCivil: EstadoCivil | "",
): Partial<WizardDraft> {
  return {
    estadoCivil,
    conjuge:
      estadoCivil !== "" && ESTADOS_CIVIS_COM_CONJUGE.includes(estadoCivil)
        ? draft.conjuge
        : null,
  };
}

/** A idade é derivada da data, nunca digitada à parte. */
export function patchDeDataNascimento(dataNascimento: string): Partial<WizardDraft> {
  return {
    dataNascimento,
    idade: dataNascimento ? calcularIdade(dataNascimento) : null,
  };
}

/** Mexer em salário ou em renda extra reescreve a renda mensal recorrente. */
export function patchDeRendas(
  salarioLiquido: number | null,
  outrasRendas: RendaExtra[],
): Partial<WizardDraft> {
  return {
    salarioLiquido,
    outrasRendas,
    rendaMensal: calcularTotaisRenda(salarioLiquido, outrasRendas).mensalRecorrente,
  };
}

/** Mesma ideia do lado da despesa. */
export function patchDeDespesas(
  despesaMensalBase: number | null,
  despesasTemporarias: DespesaTemporaria[],
): Partial<WizardDraft> {
  return {
    despesaMensalBase,
    despesasTemporarias,
    despesaMensal: calcularTotaisDespesa(despesaMensalBase, despesasTemporarias)
      .mensalRecorrente,
  };
}

// "Possui imóveis?"/"Possui automóveis?" são derivados da própria lista
// (lista vazia = "Não"), nunca guardados em estado à parte: assim o rádio
// não tem como divergir do array — remover o último bem já devolve "Não".
// Marcar "Sim" semeia um item em branco pro advisor preencher; marcar "Sim"
// com a lista já preenchida devolve a mesma lista, para o chamador saber que
// não há nada a aplicar.
export function listaAposToggle(
  atuais: PropriedadeDraft[],
  possui: boolean,
): PropriedadeDraft[] {
  if (!possui) return [];
  return atuais.length === 0 ? [criarPropriedadeVazia()] : atuais;
}
