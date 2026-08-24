import { CurrencyInput } from "../currency-input";
import { capacidadeInvestimento, taxaPoupanca } from "@/lib/calculos";
import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import { calcularTotaisDespesa, FREQUENCIA_DESPESA_OPTIONS, type FrequenciaDespesa } from "@/lib/wizard/despesas";
import { calcularTotaisRenda, FREQUENCIA_RENDA_OPTIONS, type FrequenciaRenda } from "@/lib/wizard/rendas";
import type { DespesaTemporariaDraft, RendaExtraDraft } from "@/lib/wizard/types";
import type { StepErrors } from "@/lib/wizard/validate-step";

const FREQUENCIA_RENDA_LABELS: Record<FrequenciaRenda, string> = {
  mensal: "Mensal",
  quinzenal: "Quinzenal",
  anual: "Anual",
  unica: "Única",
};

type StepFinanceiroProps = {
  salarioLiquido: number | null;
  outrasRendas: RendaExtraDraft[];
  rendaMensal: number | null;
  despesaMensalBase: number | null;
  despesasTemporarias: DespesaTemporariaDraft[];
  despesaMensal: number | null;
  patrimonioInvestido: number | null;
  localAplicado: string;
  temInvestimentoExterior: boolean;
  valorInvestimentoExterior: number | null;
  errors: StepErrors;
  onSalarioLiquidoChange: (value: number | null) => void;
  onAddOutraRenda: () => void;
  onRemoveOutraRenda: (index: number) => void;
  onChangeOutraRenda: (index: number, renda: RendaExtraDraft) => void;
  onDespesaMensalBaseChange: (value: number | null) => void;
  onAddDespesaTemporaria: () => void;
  onRemoveDespesaTemporaria: (index: number) => void;
  onChangeDespesaTemporaria: (index: number, despesa: DespesaTemporariaDraft) => void;
  onPatrimonioInvestidoChange: (value: number | null) => void;
  onLocalAplicadoChange: (value: string) => void;
  onTemInvestimentoExteriorChange: (value: boolean) => void;
  onValorInvestimentoExteriorChange: (value: number | null) => void;
};

export function StepFinanceiro({
  salarioLiquido,
  outrasRendas,
  rendaMensal,
  despesaMensalBase,
  despesasTemporarias,
  despesaMensal,
  patrimonioInvestido,
  localAplicado,
  temInvestimentoExterior,
  valorInvestimentoExterior,
  errors,
  onSalarioLiquidoChange,
  onAddOutraRenda,
  onRemoveOutraRenda,
  onChangeOutraRenda,
  onDespesaMensalBaseChange,
  onAddDespesaTemporaria,
  onRemoveDespesaTemporaria,
  onChangeDespesaTemporaria,
  onPatrimonioInvestidoChange,
  onLocalAplicadoChange,
  onTemInvestimentoExteriorChange,
  onValorInvestimentoExteriorChange,
}: StepFinanceiroProps) {
  const totaisRenda = calcularTotaisRenda(salarioLiquido, outrasRendas);
  const totaisDespesa = calcularTotaisDespesa(despesaMensalBase, despesasTemporarias);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="salarioLiquido" className={labelClass}>
          Salário líquido
        </label>
        <CurrencyInput
          id="salarioLiquido"
          value={salarioLiquido}
          onChange={onSalarioLiquidoChange}
          invalid={Boolean(errors.salarioLiquido)}
        />
        {errors.salarioLiquido && (
          <p className={errorTextClass}>{errors.salarioLiquido}</p>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Outras rendas</span>
          <button
            type="button"
            onClick={onAddOutraRenda}
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            + Adicionar
          </button>
        </div>

        {outrasRendas.length === 0 && (
          <p className="mt-3 text-sm text-gray-600">Nenhuma outra renda cadastrada.</p>
        )}

        <div className="mt-3 space-y-3">
          {outrasRendas.map((renda, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Renda {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveOutraRenda(index)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor={`outra-renda-${index}-descricao`} className={labelClass}>
                    Descrição
                  </label>
                  <input
                    id={`outra-renda-${index}-descricao`}
                    type="text"
                    value={renda.descricao}
                    onChange={(event) =>
                      onChangeOutraRenda(index, { ...renda, descricao: event.target.value })
                    }
                    className={inputClass(Boolean(errors[`outrasRendas.${index}.descricao`]))}
                  />
                </div>

                <div>
                  <label htmlFor={`outra-renda-${index}-valor`} className={labelClass}>
                    Valor
                  </label>
                  <CurrencyInput
                    id={`outra-renda-${index}-valor`}
                    value={renda.valor}
                    onChange={(valor) => onChangeOutraRenda(index, { ...renda, valor })}
                    invalid={Boolean(errors[`outrasRendas.${index}.valor`])}
                  />
                </div>

                <div>
                  <label htmlFor={`outra-renda-${index}-frequencia`} className={labelClass}>
                    Frequência
                  </label>
                  <select
                    id={`outra-renda-${index}-frequencia`}
                    value={renda.frequencia}
                    onChange={(event) =>
                      onChangeOutraRenda(index, {
                        ...renda,
                        frequencia: event.target.value as FrequenciaRenda,
                      })
                    }
                    className={inputClass(Boolean(errors[`outrasRendas.${index}.frequencia`]))}
                  >
                    {FREQUENCIA_RENDA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {FREQUENCIA_RENDA_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`outra-renda-${index}-termino`} className={labelClass}>
                    Previsão de término
                  </label>
                  <input
                    id={`outra-renda-${index}-termino`}
                    type="date"
                    value={renda.terminoEm ?? ""}
                    onChange={(event) =>
                      onChangeOutraRenda(index, {
                        ...renda,
                        terminoEm: event.target.value || null,
                      })
                    }
                    className={inputClass(Boolean(errors[`outrasRendas.${index}.terminoEm`]))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="despesaMensal" className={labelClass}>
          Despesa mensal fixa
        </label>
        <CurrencyInput
          id="despesaMensal"
          value={despesaMensalBase}
          onChange={onDespesaMensalBaseChange}
          invalid={Boolean(errors.despesaMensal)}
        />
        {errors.despesaMensal && (
          <p className={errorTextClass}>{errors.despesaMensal}</p>
        )}
      </div>



      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Despesas temporárias</span>
          <button
            type="button"
            onClick={onAddDespesaTemporaria}
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            + Adicionar
          </button>
        </div>

        {despesasTemporarias.length === 0 && (
          <p className="mt-3 text-sm text-gray-600">Nenhuma despesa temporária cadastrada.</p>
        )}

        <div className="mt-3 space-y-3">
          {despesasTemporarias.map((despesa, index) => (
            <div key={index} className="rounded-md border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Despesa {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveDespesaTemporaria(index)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor={`despesa-temporaria-${index}-descricao`} className={labelClass}>
                    Descrição
                  </label>
                  <input
                    id={`despesa-temporaria-${index}-descricao`}
                    type="text"
                    value={despesa.descricao}
                    onChange={(event) =>
                      onChangeDespesaTemporaria(index, { ...despesa, descricao: event.target.value })
                    }
                    className={inputClass(Boolean(errors[`despesasTemporarias.${index}.descricao`]))}
                  />
                </div>

                <div>
                  <label htmlFor={`despesa-temporaria-${index}-valor`} className={labelClass}>
                    Valor
                  </label>
                  <CurrencyInput
                    id={`despesa-temporaria-${index}-valor`}
                    value={despesa.valor}
                    onChange={(valor) => onChangeDespesaTemporaria(index, { ...despesa, valor })}
                    invalid={Boolean(errors[`despesasTemporarias.${index}.valor`])}
                  />
                </div>

                <div>
                  <label htmlFor={`despesa-temporaria-${index}-frequencia`} className={labelClass}>
                    Frequência
                  </label>
                  <select
                    id={`despesa-temporaria-${index}-frequencia`}
                    value={despesa.frequencia}
                    onChange={(event) =>
                      onChangeDespesaTemporaria(index, {
                        ...despesa,
                        frequencia: event.target.value as FrequenciaDespesa,
                      })
                    }
                    className={inputClass(Boolean(errors[`despesasTemporarias.${index}.frequencia`]))}
                  >
                    {FREQUENCIA_DESPESA_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {FREQUENCIA_RENDA_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor={`despesa-temporaria-${index}-termino`} className={labelClass}>
                    Previsão de término
                  </label>
                  <input
                    id={`despesa-temporaria-${index}-termino`}
                    type="date"
                    value={despesa.terminoEm ?? ""}
                    onChange={(event) =>
                      onChangeDespesaTemporaria(index, {
                        ...despesa,
                        terminoEm: event.target.value || null,
                      })
                    }
                    className={inputClass(Boolean(errors[`despesasTemporarias.${index}.terminoEm`]))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p>
          Despesa mensal total: <span className="font-medium">{formatarMoeda(totaisDespesa.mensalRecorrente)}</span>
        </p>
        <p>
          Despesa anual estimada: <span className="font-medium">{formatarMoeda(totaisDespesa.anualEstimado)}</span>
        </p>
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



      <div>
        <label htmlFor="localAplicado" className={labelClass}>
          Local aplicado
        </label>
        <input
          id="localAplicado"
          type="text"
          value={localAplicado}
          onChange={(event) => onLocalAplicadoChange(event.target.value)}
          className={inputClass(Boolean(errors.localAplicado))}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={temInvestimentoExterior}
            onChange={(event) => onTemInvestimentoExteriorChange(event.target.checked)}
          />
          Investimento no exterior
        </label>

        {temInvestimentoExterior && (
          <div className="mt-3">
            <label htmlFor="valorInvestimentoExterior" className={labelClass}>
              Valor no exterior
            </label>
            <CurrencyInput
              id="valorInvestimentoExterior"
              value={valorInvestimentoExterior}
              onChange={onValorInvestimentoExteriorChange}
              invalid={Boolean(errors.valorInvestimentoExterior)}
            />
          </div>
        )}
      </div>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p>
          Renda mensal total: <span className="font-medium">{formatarMoeda(totaisRenda.mensalRecorrente)}</span>
        </p>
        <p>
          Renda anual estimada: <span className="font-medium">{formatarMoeda(totaisRenda.anualEstimado)}</span>
        </p>
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
