import type { Assumptions } from "@/lib/types/cliente";

// Premissas padrão sugeridas pela function create_client_full (ver
// supabase/migrations/003_create_client_full.sql) — usadas aqui só como
// fallback defensivo caso a linha em `assumptions` não exista.
const PADRAO = {
  inflacaoProjetadaPct: 4,
  cdiAtualPct: 14.15,
  rentabilidadeRealPadraoPct: 4.75,
};

export type AssumptionsResolvidas = {
  inflacaoProjetadaPct: number;
  cdiAtualPct: number;
  rentabilidadeRealPadraoPct: number;
  /** true se algum valor veio do fallback (sem linha salva em assumptions). */
  usandoPadrao: boolean;
};

// `assumptions` fica salvo no banco como fração (0.0475), mas
// lib/calculos.ts trabalha com percentual (4.75) — a conversão é feita aqui,
// num único lugar.
export function resolverAssumptions(
  assumptions: Assumptions | null,
): AssumptionsResolvidas {
  if (
    !assumptions ||
    assumptions.inflacao_projetada == null ||
    assumptions.cdi_atual == null ||
    assumptions.rentabilidade_real_padrao == null
  ) {
    return { ...PADRAO, usandoPadrao: true };
  }

  return {
    inflacaoProjetadaPct: assumptions.inflacao_projetada * 100,
    cdiAtualPct: assumptions.cdi_atual * 100,
    rentabilidadeRealPadraoPct: assumptions.rentabilidade_real_padrao * 100,
    usandoPadrao: false,
  };
}
