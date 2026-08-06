const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor == null) return "não informado";
  return currencyFormatter.format(valor);
}

export function formatarPercentual(valor: number, casasDecimais = 1): string {
  return `${valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  })}%`;
}
