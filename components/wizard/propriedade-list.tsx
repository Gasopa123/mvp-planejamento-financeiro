import { PropriedadeFields } from "./propriedade-fields";
import type { PropriedadeDraft } from "@/lib/wizard/types";
import type { StepErrors } from "@/lib/wizard/validate-step";

type PropriedadeListProps = {
  idPrefix: string;
  bemTipo: "imovel" | "automovel";
  titulo: string;
  itemLabel: string;
  addLabel: string;
  emptyLabel: string;
  items: PropriedadeDraft[];
  errors: StepErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, item: PropriedadeDraft) => void;
};

// Lista dinâmica de propriedades (imóveis ou automóveis), reaproveitada
// pelas duas seções da etapa Patrimônio.
export function PropriedadeList({
  idPrefix,
  bemTipo,
  titulo,
  itemLabel,
  addLabel,
  emptyLabel,
  items,
  errors,
  onAdd,
  onRemove,
  onChange,
}: PropriedadeListProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{titulo}</h3>

      <div className="mt-3 space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-gray-600">{emptyLabel}</p>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {itemLabel} {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Remover
              </button>
            </div>

            <div className="mt-3">
              <PropriedadeFields
                idPrefix={`${idPrefix}-${index}`}
                bemTipo={bemTipo}
                valor={item.valor}
                financiado={item.financiado}
                adquiridoAposCasamento={item.adquiridoAposCasamento}
                subtipo={item.subtipo}
                modelo={item.modelo}
                financiamentoTermino={item.financiamentoTermino}
                parcelaFinanciamento={item.parcelaFinanciamento}
                errors={{
                  valor: errors[`${index}.valor`],
                  subtipo: errors[`${index}.subtipo`],
                  modelo: errors[`${index}.modelo`],
                  financiamentoTermino: errors[`${index}.financiamentoTermino`],
                  parcelaFinanciamento: errors[`${index}.parcelaFinanciamento`],
                }}
                onValorChange={(valor) => onChange(index, { ...item, valor })}
                onFinanciadoChange={(financiado) =>
                  onChange(index, { ...item, financiado })
                }
                onAdquiridoAposCasamentoChange={(adquiridoAposCasamento) =>
                  onChange(index, { ...item, adquiridoAposCasamento })
                }
                onSubtipoChange={(subtipo) => onChange(index, { ...item, subtipo })}
                onModeloChange={(modelo) => onChange(index, { ...item, modelo })}
                onFinanciamentoTerminoChange={(financiamentoTermino) =>
                  onChange(index, { ...item, financiamentoTermino })
                }
                onParcelaFinanciamentoChange={(parcelaFinanciamento) =>
                  onChange(index, { ...item, parcelaFinanciamento })
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
