import { CurrencyInput } from "../currency-input";
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
    </div>
  );
}
