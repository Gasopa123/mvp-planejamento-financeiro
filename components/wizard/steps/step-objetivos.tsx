import { CurrencyInput } from "../currency-input";
import { formatarMoeda } from "@/lib/format";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import { PRAZO_LABELS, PRAZO_OPTIONS, type Prazo } from "@/lib/wizard/schema";
import type { ObjetivoDraft } from "@/lib/wizard/types";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepObjetivosProps = {
  objetivos: ObjetivoDraft[];
  errors: StepErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, objetivo: ObjetivoDraft) => void;
};

export function StepObjetivos({
  objetivos,
  errors,
  onAdd,
  onRemove,
  onChange,
}: StepObjetivosProps) {
  return (
    <div className="space-y-4">
      {objetivos.length === 0 && (
        <p className="text-sm text-gray-600">
          Nenhum objetivo cadastrado ainda.
        </p>
      )}

      {objetivos.map((objetivo, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              Objetivo {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Remover
            </button>
          </div>

          <div className="mt-3 space-y-4">
            <div>
              <label
                htmlFor={`objetivo-${index}-prazo`}
                className={labelClass}
              >
                Prazo
              </label>
              <select
                id={`objetivo-${index}-prazo`}
                value={objetivo.prazo}
                onChange={(event) =>
                  onChange(index, {
                    ...objetivo,
                    prazo: event.target.value as Prazo | "",
                  })
                }
                className={inputClass(Boolean(errors[`${index}.prazo`]))}
              >
                <option value="">Selecione...</option>
                {PRAZO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {PRAZO_LABELS[option]}
                  </option>
                ))}
              </select>
              {errors[`${index}.prazo`] && (
                <p className={errorTextClass}>{errors[`${index}.prazo`]}</p>
              )}
            </div>

            <div>
              <label
                htmlFor={`objetivo-${index}-descricao`}
                className={labelClass}
              >
                Descrição
              </label>
              <input
                id={`objetivo-${index}-descricao`}
                type="text"
                value={objetivo.descricao}
                onChange={(event) =>
                  onChange(index, { ...objetivo, descricao: event.target.value })
                }
                className={inputClass(Boolean(errors[`${index}.descricao`]))}
              />
              {errors[`${index}.descricao`] && (
                <p className={errorTextClass}>
                  {errors[`${index}.descricao`]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`objetivo-${index}-valor`}
                className={labelClass}
              >
                Valor estimado
              </label>
              <CurrencyInput
                id={`objetivo-${index}-valor`}
                value={objetivo.valorEstimado}
                onChange={(valorEstimado) =>
                  onChange(index, { ...objetivo, valorEstimado })
                }
                invalid={Boolean(errors[`${index}.valorEstimado`])}
              />
              {errors[`${index}.valorEstimado`] && (
                <p className={errorTextClass}>
                  {errors[`${index}.valorEstimado`]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={`objetivo-${index}-horizonte`}
                className={labelClass}
              >
                Horizonte (anos)
              </label>
              <input
                id={`objetivo-${index}-horizonte`}
                type="number"
                min={0}
                value={objetivo.horizonteAnos ?? ""}
                onChange={(event) =>
                  onChange(index, {
                    ...objetivo,
                    horizonteAnos:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
                className={inputClass(
                  Boolean(errors[`${index}.horizonteAnos`]),
                )}
              />
              {errors[`${index}.horizonteAnos`] && (
                <p className={errorTextClass}>
                  {errors[`${index}.horizonteAnos`]}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        + Adicionar objetivo
      </button>

      {objetivos.length > 0 && <ResumoObjetivos objetivos={objetivos} />}
    </div>
  );
}

export type ResumoObjetivosValores = {
  total: number;
  porPrazo: Record<Prazo, number>;
  somaValorEstimado: number;
  maiorHorizonteAnos: number | null;
};

/** Resumo dos objetivos: total, quantidade por prazo, soma dos valores e maior horizonte. */
export function resumirObjetivos(
  objetivos: ObjetivoDraft[],
): ResumoObjetivosValores {
  const porPrazo: Record<Prazo, number> = { curto: 0, medio: 0, longo: 0 };
  let somaValorEstimado = 0;
  let maiorHorizonteAnos: number | null = null;

  for (const objetivo of objetivos) {
    if (objetivo.prazo) {
      porPrazo[objetivo.prazo] += 1;
    }
    if (objetivo.valorEstimado != null) {
      somaValorEstimado += objetivo.valorEstimado;
    }
    if (
      objetivo.horizonteAnos != null &&
      (maiorHorizonteAnos == null || objetivo.horizonteAnos > maiorHorizonteAnos)
    ) {
      maiorHorizonteAnos = objetivo.horizonteAnos;
    }
  }

  return {
    total: objetivos.length,
    porPrazo,
    somaValorEstimado,
    maiorHorizonteAnos,
  };
}

function ResumoObjetivos({ objetivos }: { objetivos: ObjetivoDraft[] }) {
  const resumo = resumirObjetivos(objetivos);

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      <p>
        Total de objetivos:{" "}
        <span className="font-medium">{resumo.total}</span>
      </p>
      <p>
        {PRAZO_LABELS.curto}: {resumo.porPrazo.curto} · {PRAZO_LABELS.medio}:{" "}
        {resumo.porPrazo.medio} · {PRAZO_LABELS.longo}: {resumo.porPrazo.longo}
      </p>
      <p>
        Soma dos valores estimados:{" "}
        <span className="font-medium">
          {formatarMoeda(resumo.somaValorEstimado)}
        </span>
      </p>
      <p>
        Maior horizonte informado:{" "}
        <span className="font-medium">
          {resumo.maiorHorizonteAnos == null
            ? "não informado"
            : `${resumo.maiorHorizonteAnos} anos`}
        </span>
      </p>
    </div>
  );
}
