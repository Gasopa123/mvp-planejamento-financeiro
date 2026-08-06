import { CurrencyInput } from "./currency-input";
import { SimNaoField } from "./sim-nao-field";
import { errorTextClass, labelClass } from "@/lib/wizard/field-styles";

type PropriedadeFieldsErrors = {
  valor?: string;
};

type PropriedadeFieldsProps = {
  idPrefix: string;
  valor: number | null;
  financiado: boolean;
  adquiridoAposCasamento: boolean;
  errors?: PropriedadeFieldsErrors;
  onValorChange: (value: number | null) => void;
  onFinanciadoChange: (value: boolean) => void;
  onAdquiridoAposCasamentoChange: (value: boolean) => void;
};

// Campos valor / financiado / adquirido após o casamento, compartilhados
// entre as listas de imóveis e automóveis da etapa Patrimônio.
export function PropriedadeFields({
  idPrefix,
  valor,
  financiado,
  adquiridoAposCasamento,
  errors,
  onValorChange,
  onFinanciadoChange,
  onAdquiridoAposCasamentoChange,
}: PropriedadeFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-valor`} className={labelClass}>
          Valor
        </label>
        <CurrencyInput
          id={`${idPrefix}-valor`}
          value={valor}
          onChange={onValorChange}
          invalid={Boolean(errors?.valor)}
        />
        {errors?.valor && <p className={errorTextClass}>{errors.valor}</p>}
      </div>

      <SimNaoField
        label="Financiado?"
        name={`${idPrefix}-financiado`}
        value={financiado}
        onChange={onFinanciadoChange}
      />

      <SimNaoField
        label="Adquirido após o casamento?"
        name={`${idPrefix}-adquirido-apos-casamento`}
        value={adquiridoAposCasamento}
        onChange={onAdquiridoAposCasamentoChange}
      />
    </div>
  );
}
