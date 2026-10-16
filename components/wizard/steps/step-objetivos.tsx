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
        <p className="text-sm text-ink-60">
          Nenhum objetivo cadastrado ainda.
        </p>
      )}

      {objetivos.map((objetivo, index) => (
        <div
          key={index}
          className="rounded-card-sm border border-line bg-canvas p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-navy">
              Objetivo {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-sm font-semibold text-danger hover:underline"
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
        className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-blue-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
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
    <div className="rounded-card-sm border border-line bg-canvas p-4 text-sm text-ink-60">
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
