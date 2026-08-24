import { CurrencyInput } from "./currency-input";
import { SimNaoField } from "./sim-nao-field";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";

type PropriedadeFieldsErrors = {
  valor?: string;
  subtipo?: string;
  modelo?: string;
  financiamentoTermino?: string;
  parcelaFinanciamento?: string;
};

type PropriedadeFieldsProps = {
  idPrefix: string;
  bemTipo: "imovel" | "automovel";
  valor: number | null;
  financiado: boolean;
  adquiridoAposCasamento: boolean;
  subtipo: string;
  modelo: string;
  financiamentoTermino: string | null;
  parcelaFinanciamento: number | null;
  errors?: PropriedadeFieldsErrors;
  onValorChange: (value: number | null) => void;
  onFinanciadoChange: (value: boolean) => void;
  onAdquiridoAposCasamentoChange: (value: boolean) => void;
  onSubtipoChange: (value: string) => void;
  onModeloChange: (value: string) => void;
  onFinanciamentoTerminoChange: (value: string | null) => void;
  onParcelaFinanciamentoChange: (value: number | null) => void;
};

// Campos valor / financiado / adquirido após o casamento, compartilhados
// entre as listas de imóveis e automóveis da etapa Patrimônio.
export function PropriedadeFields({
  idPrefix,
  bemTipo,
  valor,
  financiado,
  adquiridoAposCasamento,
  subtipo,
  modelo,
  financiamentoTermino,
  parcelaFinanciamento,
  errors,
  onValorChange,
  onFinanciadoChange,
  onAdquiridoAposCasamentoChange,
  onSubtipoChange,
  onModeloChange,
  onFinanciamentoTerminoChange,
  onParcelaFinanciamentoChange,
}: PropriedadeFieldsProps) {
  return (
    <div className="space-y-4">

      <div>
        <label htmlFor={`${idPrefix}-subtipo`} className={labelClass}>
          Tipo
        </label>
        <select
          id={`${idPrefix}-subtipo`}
          value={subtipo}
          onChange={(event) => onSubtipoChange(event.target.value)}
          className={inputClass(Boolean(errors?.subtipo))}
        >
          <option value="">Selecione...</option>
          {bemTipo === "imovel" ? (
            <>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
            </>
          ) : (
            <>
              <option value="carro">Carro</option>
              <option value="moto">Moto</option>
              <option value="outro">Outro</option>
            </>
          )}
        </select>
      </div>

      {bemTipo === "automovel" && (
        <div>
          <label htmlFor={`${idPrefix}-modelo`} className={labelClass}>
            Modelo
          </label>
          <input
            id={`${idPrefix}-modelo`}
            type="text"
            value={modelo}
            onChange={(event) => onModeloChange(event.target.value)}
            className={inputClass(Boolean(errors?.modelo))}
          />
        </div>
      )}

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


      {financiado && (
        <>
          <div>
            <label htmlFor={`${idPrefix}-financiamento-termino`} className={labelClass}>
              Previsão de término
            </label>
            <input
              id={`${idPrefix}-financiamento-termino`}
              type="date"
              value={financiamentoTermino ?? ""}
              onChange={(event) => onFinanciamentoTerminoChange(event.target.value || null)}
              className={inputClass(Boolean(errors?.financiamentoTermino))}
            />
          </div>

          <div>
            <label htmlFor={`${idPrefix}-parcela-financiamento`} className={labelClass}>
              Parcela do financiamento
            </label>
            <CurrencyInput
              id={`${idPrefix}-parcela-financiamento`}
              value={parcelaFinanciamento}
              onChange={onParcelaFinanciamentoChange}
              invalid={Boolean(errors?.parcelaFinanciamento)}
            />
          </div>
        </>
      )}
    </div>
  );
}
