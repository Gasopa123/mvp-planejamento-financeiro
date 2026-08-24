import { FREQUENCIA_RENDA_OPTIONS, type FrequenciaRenda } from "./rendas";

export const FREQUENCIA_DESPESA_OPTIONS = FREQUENCIA_RENDA_OPTIONS;
export type FrequenciaDespesa = FrequenciaRenda;

export type DespesaTemporaria = {
  descricao: string;
  valor: number | null;
  frequencia: FrequenciaDespesa;
  terminoEm: string | null;
};

export function calcularTotaisDespesa(
  despesaMensalBase: number | null,
  despesasTemporarias: DespesaTemporaria[],
) {
  let mensalRecorrente = despesaMensalBase ?? 0;
  let anualUnico = 0;

  for (const despesa of despesasTemporarias) {
    const valor = despesa.valor ?? 0;
    if (despesa.frequencia === "mensal") mensalRecorrente += valor;
    if (despesa.frequencia === "quinzenal") mensalRecorrente += (valor * 26) / 12;
    if (despesa.frequencia === "anual") mensalRecorrente += valor / 12;
    if (despesa.frequencia === "unica") anualUnico += valor;
  }

  return {
    mensalRecorrente: Math.round(mensalRecorrente * 100) / 100,
    anualEstimado: Math.round((mensalRecorrente * 12 + anualUnico) * 100) / 100,
  };
}
