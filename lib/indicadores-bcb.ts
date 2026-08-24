export const BCB_SERIES = {
  cdi: 12,
  ipca: 433,
} as const;

export function bcbSerieUrl(serie: number): string {
  return `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`;
}

type BcbRow = { data: string; valor: string };

export function anualizarCdiDiario(valorDiarioPct: number): number {
  return (Math.pow(1 + valorDiarioPct / 100, 252) - 1) * 100;
}

export function anualizarIpcaMensal(valorMensalPct: number): number {
  return (Math.pow(1 + valorMensalPct / 100, 12) - 1) * 100;
}

async function fetchUltimoSgs(serie: number): Promise<{ valor: number; data: string }> {
  const response = await fetch(bcbSerieUrl(serie), { next: { revalidate: 60 * 60 * 12 } });
  if (!response.ok) throw new Error(`BCB ${serie}: HTTP ${response.status}`);
  const [row] = (await response.json()) as BcbRow[];
  if (!row) throw new Error(`BCB ${serie}: sem dados`);
  return { valor: Number(row.valor.replace(",", ".")), data: row.data };
}

export async function buscarIndicadoresBcb() {
  const [cdi, ipca] = await Promise.all([
    fetchUltimoSgs(BCB_SERIES.cdi),
    fetchUltimoSgs(BCB_SERIES.ipca),
  ]);
  return {
    cdiAtualPct: anualizarCdiDiario(cdi.valor),
    inflacaoProjetadaPct: anualizarIpcaMensal(ipca.valor),
    atualizadoEm: cdi.data,
  };
}
