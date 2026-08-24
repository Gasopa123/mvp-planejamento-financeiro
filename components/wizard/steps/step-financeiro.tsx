import { CurrencyInput } from "../currency-input";
import { capacidadeInvestimento, taxaPoupanca } from "@/lib/calculos";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { errorTextClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepFinanceiroProps = {
  rendaMensal: number | null;
  despesaMensal: number | null;
  patrimonioInvestido: number | null;
  errors: StepErrors;
  onRendaMensalChange: (value: number | null) => void;
  onDespesaMensalChange: (value: number | null) => void;
  onPatrimonioInvestidoChange: (value: number | null) => void;
};

export function StepFinanceiro({
  rendaMensal,
  despesaMensal,
  patrimonioInvestido,
  errors,
  onRendaMensalChange,
  onDespesaMensalChange,
  onPatrimonioInvestidoChange,
}: StepFinanceiroProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="rendaMensal" className={labelClass}>
          Renda mensal
        </label>
        <CurrencyInput
          id="rendaMensal"
          value={rendaMensal}
          onChange={onRendaMensalChange}
          invalid={Boolean(errors.rendaMensal)}
        />
        {errors.rendaMensal && (
          <p className={errorTextClass}>{errors.rendaMensal}</p>
        )}
      </div>

      <div>
        <label htmlFor="despesaMensal" className={labelClass}>
          Despesa mensal
        </label>
        <CurrencyInput
          id="despesaMensal"
          value={despesaMensal}
          onChange={onDespesaMensalChange}
          invalid={Boolean(errors.despesaMensal)}
        />
        {errors.despesaMensal && (
          <p className={errorTextClass}>{errors.despesaMensal}</p>
        )}
      </div>

      <div>
        <label htmlFor="patrimonioInvestido" className={labelClass}>
          Patrimônio investido
        </label>
        <CurrencyInput
          id="patrimonioInvestido"
          value={patrimonioInvestido}
          onChange={onPatrimonioInvestidoChange}
          invalid={Boolean(errors.patrimonioInvestido)}
        />
        {errors.patrimonioInvestido && (
          <p className={errorTextClass}>{errors.patrimonioInvestido}</p>
        )}
      </div>

      {rendaMensal != null && despesaMensal != null && (
        <ResumoFinanceiro
          rendaMensal={rendaMensal}
          despesaMensal={despesaMensal}
        />
      )}
    </div>
  );
}

/** Rótulo da taxa de poupança: renda <= 0 torna capacidade/renda indefinida. */
export function taxaPoupancaLabel(
  rendaMensal: number,
  despesaMensal: number,
): string {
  if (rendaMensal <= 0) {
    return "Não aplicável";
  }
  return formatarPercentual(taxaPoupanca(rendaMensal, despesaMensal) * 100);
}

export function deveAlertarDespesaMaiorQueRenda(
  rendaMensal: number,
  despesaMensal: number,
): boolean {
  return despesaMensal > rendaMensal;
}

function ResumoFinanceiro({
  rendaMensal,
  despesaMensal,
}: {
  rendaMensal: number;
  despesaMensal: number;
}) {
  const despesaMaiorQueRenda = deveAlertarDespesaMaiorQueRenda(
    rendaMensal,
    despesaMensal,
  );
  const capacidade = capacidadeInvestimento(rendaMensal, despesaMensal);

  return (
    <div
      className={`rounded-md border p-4 text-sm ${
        despesaMaiorQueRenda
          ? "border-red-400 bg-red-50 text-red-700"
          : "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      <p>
        Capacidade de investimento:{" "}
        <span className="font-medium">{formatarMoeda(capacidade)}</span>
      </p>
      <p>
        Taxa de poupança:{" "}
        <span className="font-medium">
          {taxaPoupancaLabel(rendaMensal, despesaMensal)}
        </span>
      </p>
      {despesaMaiorQueRenda && (
        <p role="alert" className="mt-2 font-medium">
          Atenção: a despesa mensal é maior que a renda mensal.
        </p>
      )}
    </div>
  );
}
