import type { StepErrors } from "@/lib/wizard/validate-step";
import {
  criarDespesaTemporariaVazia,
  criarPropriedadeVazia,
  criarRendaExtraVazia,
} from "@/lib/wizard/types";
import type {
  DespesaTemporariaDraft,
  RendaExtraDraft,
  WizardDraft,
} from "@/lib/wizard/types";
import { StepFinanceiro } from "./steps/step-financeiro";
import { StepPatrimonio } from "./steps/step-patrimonio";
import { StepSocietario } from "./steps/step-societario";

type ClientWizardFinanceiroProps = {
  formData: WizardDraft;
  errors: StepErrors;
  updateFormData: (patch: Partial<WizardDraft>) => void;
  updateRendas: (
    salarioLiquido?: number | null,
    outrasRendas?: RendaExtraDraft[],
  ) => void;
  updateDespesas: (
    despesaMensalBase?: number | null,
    despesasTemporarias?: DespesaTemporariaDraft[],
  ) => void;
  onTogglePossuiImoveis: (value: boolean) => void;
  onTogglePossuiAutomoveis: (value: boolean) => void;
};

// A etapa "financeiro" do wizard junta três grupos de campos: renda e
// despesa, bens, e participação societária. Só a fiação mora aqui — o
// rascunho e as transformações continuam no ClientWizard.
export function ClientWizardFinanceiro({
  formData,
  errors,
  updateFormData,
  updateRendas,
  updateDespesas,
  onTogglePossuiImoveis,
  onTogglePossuiAutomoveis,
}: ClientWizardFinanceiroProps) {
  return (
    <>
      <StepFinanceiro
        salarioLiquido={formData.salarioLiquido}
        outrasRendas={formData.outrasRendas}
        rendaMensal={formData.rendaMensal}
        despesaMensalBase={formData.despesaMensalBase}
        despesasTemporarias={formData.despesasTemporarias}
        despesaMensal={formData.despesaMensal}
        patrimonioInvestido={formData.patrimonioInvestido}
        localAplicado={formData.localAplicado}
        temInvestimentoExterior={formData.temInvestimentoExterior}
        valorInvestimentoExterior={formData.valorInvestimentoExterior}
        errors={errors}
        onSalarioLiquidoChange={(salarioLiquido) => updateRendas(salarioLiquido)}
        onAddOutraRenda={() =>
          updateRendas(formData.salarioLiquido, [
            ...formData.outrasRendas,
            criarRendaExtraVazia(),
          ])
        }
        onRemoveOutraRenda={(index) =>
          updateRendas(
            formData.salarioLiquido,
            formData.outrasRendas.filter((_, i) => i !== index),
          )
        }
        onChangeOutraRenda={(index, renda) =>
          updateRendas(
            formData.salarioLiquido,
            formData.outrasRendas.map((r, i) => (i === index ? renda : r)),
          )
        }
        onDespesaMensalBaseChange={(despesaMensalBase) =>
          updateDespesas(despesaMensalBase)
        }
        onAddDespesaTemporaria={() =>
          updateDespesas(formData.despesaMensalBase, [
            ...formData.despesasTemporarias,
            criarDespesaTemporariaVazia(),
          ])
        }
        onRemoveDespesaTemporaria={(index) =>
          updateDespesas(
            formData.despesaMensalBase,
            formData.despesasTemporarias.filter((_, i) => i !== index),
          )
        }
        onChangeDespesaTemporaria={(index, despesa) =>
          updateDespesas(
            formData.despesaMensalBase,
            formData.despesasTemporarias.map((d, i) =>
              i === index ? despesa : d,
            ),
          )
        }
        onPatrimonioInvestidoChange={(patrimonioInvestido) =>
          updateFormData({ patrimonioInvestido })
        }
        onLocalAplicadoChange={(localAplicado) =>
          updateFormData({ localAplicado })
        }
        onTemInvestimentoExteriorChange={(temInvestimentoExterior) =>
          updateFormData({
            temInvestimentoExterior,
            valorInvestimentoExterior: temInvestimentoExterior
              ? formData.valorInvestimentoExterior
              : null,
          })
        }
        onValorInvestimentoExteriorChange={(valorInvestimentoExterior) =>
          updateFormData({ valorInvestimentoExterior })
        }
      />

      <div className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Imóveis e automóveis
        </h2>
        <StepPatrimonio
          imoveis={formData.imoveis}
          automoveis={formData.automoveis}
          errors={errors}
          onTogglePossuiImoveis={onTogglePossuiImoveis}
          onTogglePossuiAutomoveis={onTogglePossuiAutomoveis}
          onAddImovel={() =>
            updateFormData({
              imoveis: [...formData.imoveis, criarPropriedadeVazia()],
            })
          }
          onRemoveImovel={(index) =>
            updateFormData({
              imoveis: formData.imoveis.filter((_, i) => i !== index),
            })
          }
          onChangeImovel={(index, item) =>
            updateFormData({
              imoveis: formData.imoveis.map((it, i) =>
                i === index ? item : it,
              ),
            })
          }
          onAddAutomovel={() =>
            updateFormData({
              automoveis: [...formData.automoveis, criarPropriedadeVazia()],
            })
          }
          onRemoveAutomovel={(index) =>
            updateFormData({
              automoveis: formData.automoveis.filter((_, i) => i !== index),
            })
          }
          onChangeAutomovel={(index, item) =>
            updateFormData({
              automoveis: formData.automoveis.map((it, i) =>
                i === index ? item : it,
              ),
            })
          }
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Participação societária
        </h2>
        <StepSocietario
          temParticipacaoSocietaria={formData.temParticipacaoSocietaria}
          valorParticipacao={formData.valorParticipacao}
          percentualParticipacao={formData.percentualParticipacao}
          errors={errors}
          onTemParticipacaoSocietariaChange={(temParticipacaoSocietaria) =>
            updateFormData({ temParticipacaoSocietaria })
          }
          onValorParticipacaoChange={(valorParticipacao) =>
            updateFormData({ valorParticipacao })
          }
          onPercentualParticipacaoChange={(percentualParticipacao) =>
            updateFormData({ percentualParticipacao })
          }
        />
      </div>
    </>
  );
}
