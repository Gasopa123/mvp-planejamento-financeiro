export const FREQUENCIA_RENDA_OPTIONS = [
  "mensal",
  "quinzenal",
  "anual",
  "unica",
] as const;

export type FrequenciaRenda = (typeof FREQUENCIA_RENDA_OPTIONS)[number];

export type RendaExtra = {
  descricao: string;
  valor: number | null;
  frequencia: FrequenciaRenda;
  terminoEm: string | null;
};

export function calcularTotaisRenda(
  salarioLiquido: number | null,
  outrasRendas: RendaExtra[],
) {
  let mensalRecorrente = salarioLiquido ?? 0;
  let anualUnico = 0;

  for (const renda of outrasRendas) {
    const valor = renda.valor ?? 0;
    if (renda.frequencia === "mensal") mensalRecorrente += valor;
    if (renda.frequencia === "quinzenal") mensalRecorrente += (valor * 26) / 12;
    if (renda.frequencia === "anual") mensalRecorrente += valor / 12;
    if (renda.frequencia === "unica") anualUnico += valor;
  }

  return {
    mensalRecorrente: Math.round(mensalRecorrente * 100) / 100,
    anualEstimado: Math.round((mensalRecorrente * 12 + anualUnico) * 100) / 100,
  };
}
