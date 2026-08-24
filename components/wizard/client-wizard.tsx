"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClienteCompleto } from "@/app/carteira/novo/actions";
import { calcularIdade } from "@/lib/idade";
import { calcularTotaisDespesa } from "@/lib/wizard/despesas";
import { calcularTotaisRenda } from "@/lib/wizard/rendas";
import { ESTADOS_CIVIS_COM_CONJUGE, wizardFormSchema, type EstadoCivil } from "@/lib/wizard/schema";
import {
  WIZARD_STEPS,
  criarDespesaTemporariaVazia,
  criarObjetivoVazio,
  criarPessoaVazia,
  criarPropriedadeVazia,
  criarRendaExtraVazia,
  criarWizardDraftInicial,
} from "@/lib/wizard/types";
import type { WizardDraft } from "@/lib/wizard/types";
import { validateStep, type StepErrors } from "@/lib/wizard/validate-step";
import { StepPessoal } from "./steps/step-pessoal";
import { StepFinanceiro } from "./steps/step-financeiro";
import { StepPatrimonio } from "./steps/step-patrimonio";
import { StepObjetivos } from "./steps/step-objetivos";
import { StepSocietario } from "./steps/step-societario";
import { StepAposentadoria } from "./steps/step-aposentadoria";
import { StepPlanosFuturos } from "./steps/step-planos-futuros";

export function ClientWizard() {
  const router = useRouter();
  const [formData, setFormData] = useState<WizardDraft>(criarWizardDraftInicial);
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleSteps = WIZARD_STEPS;
  const currentStep = visibleSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === visibleSteps.length - 1;

  function updateFormData(patch: Partial<WizardDraft>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function handleEstadoCivilChange(estadoCivil: EstadoCivil | "") {
    setFormData((prev) => ({
      ...prev,
      estadoCivil,
      conjuge:
        estadoCivil !== "" && ESTADOS_CIVIS_COM_CONJUGE.includes(estadoCivil)
          ? prev.conjuge
          : null,
    }));
  }

  function handleDataNascimentoChange(dataNascimento: string) {
    updateFormData({
      dataNascimento,
      idade: dataNascimento ? calcularIdade(dataNascimento) : null,
    });
  }

  function updateRendas(
    salarioLiquido = formData.salarioLiquido,
    outrasRendas = formData.outrasRendas,
  ) {
    updateFormData({
      salarioLiquido,
      outrasRendas,
      rendaMensal: calcularTotaisRenda(salarioLiquido, outrasRendas).mensalRecorrente,
    });
  }

  function updateDespesas(
    despesaMensalBase = formData.despesaMensalBase,
    despesasTemporarias = formData.despesasTemporarias,
  ) {
    updateFormData({
      despesaMensalBase,
      despesasTemporarias,
      despesaMensal: calcularTotaisDespesa(
        despesaMensalBase,
        despesasTemporarias,
      ).mensalRecorrente,
    });
  }

  function handleNext() {
    const stepErrors = validateStep(currentStep.id, formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setErrors({});
    setStepIndex((index) => Math.min(index + 1, visibleSteps.length - 1));
  }

  function handlePrevious() {
    setErrors({});
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function handleSubmit() {
    const stepErrors = validateStep(currentStep.id, formData);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    const parsed = wizardFormSchema.safeParse(formData);
    if (!parsed.success) {
      setSubmitError(
        "Revise as etapas anteriores — há campos obrigatórios não preenchidos.",
      );
      return;
    }

    setSubmitError(null);
    startTransition(async () => {
      const result = await createClienteCompleto(parsed.data);
      if (result.error) {
        setSubmitError(result.error);
        return;
      }
      router.push("/carteira");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <ol className="mb-8 flex flex-wrap gap-x-4 gap-y-2">
        {visibleSteps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                index === stepIndex
                  ? "bg-gray-900 text-white"
                  : index < stepIndex
                    ? "bg-gray-300 text-gray-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`text-xs ${
                index === stepIndex
                  ? "font-medium text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">
          {currentStep.label}
        </h1>

        {currentStep.id === "pessoal" && (
          <StepPessoal
            nome={formData.nome}
            dataNascimento={formData.dataNascimento}
            profissao={formData.profissao}
            eClt={formData.eClt}
            estadoCivil={formData.estadoCivil}
            conjuge={formData.conjuge ?? criarPessoaVazia()}
            filhos={formData.filhos}
            esporteFavorito={formData.esporteFavorito}
            hobbies={formData.hobbies}
            temSeguroVida={formData.temSeguroVida}
            pesoKg={formData.pesoKg}
            alturaCm={formData.alturaCm}
            possuiPatologia={formData.possuiPatologia}
            patologias={formData.patologias}
            usaMedicamentos={formData.usaMedicamentos}
            medicamentos={formData.medicamentos}
            fuma={formData.fuma}
            andaMoto={formData.andaMoto}
            frequenciaMoto={formData.frequenciaMoto}
            errors={errors}
            onNomeChange={(nome) => updateFormData({ nome })}
            onDataNascimentoChange={handleDataNascimentoChange}
            onProfissaoChange={(profissao) => updateFormData({ profissao })}
            onECltChange={(eClt) => updateFormData({ eClt })}
            onEstadoCivilChange={handleEstadoCivilChange}
            onConjugeChange={(conjuge) => updateFormData({ conjuge })}
            onAddFilho={() =>
              updateFormData({ filhos: [...formData.filhos, criarPessoaVazia()] })
            }
            onRemoveFilho={(index) =>
              updateFormData({
                filhos: formData.filhos.filter((_, i) => i !== index),
              })
            }
            onChangeFilho={(index, filho) =>
              updateFormData({
                filhos: formData.filhos.map((f, i) => (i === index ? filho : f)),
              })
            }
            onEsporteFavoritoChange={(esporteFavorito) =>
              updateFormData({ esporteFavorito })
            }
            onHobbiesChange={(hobbies) => updateFormData({ hobbies })}
            onTemSeguroVidaChange={(temSeguroVida) =>
              updateFormData({ temSeguroVida })
            }
            onPesoKgChange={(pesoKg) => updateFormData({ pesoKg })}
            onAlturaCmChange={(alturaCm) => updateFormData({ alturaCm })}
            onPossuiPatologiaChange={(possuiPatologia) =>
              updateFormData({ possuiPatologia })
            }
            onPatologiasChange={(patologias) =>
              updateFormData({ patologias })
            }
            onUsaMedicamentosChange={(usaMedicamentos) =>
              updateFormData({ usaMedicamentos })
            }
            onMedicamentosChange={(medicamentos) =>
              updateFormData({ medicamentos })
            }
            onFumaChange={(fuma) => updateFormData({ fuma })}
            onAndaMotoChange={(andaMoto) => updateFormData({ andaMoto })}
            onFrequenciaMotoChange={(frequenciaMoto) =>
              updateFormData({ frequenciaMoto })
            }
          />
        )}

        {currentStep.id === "financeiro" && (
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
        )}

        {currentStep.id === "patrimonio" && (
          <StepPatrimonio
            imoveis={formData.imoveis}
            automoveis={formData.automoveis}
            errors={errors}
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
        )}

        {currentStep.id === "objetivos" && (
          <StepObjetivos
            objetivos={formData.objetivos}
            errors={errors}
            onAdd={() =>
              updateFormData({
                objetivos: [...formData.objetivos, criarObjetivoVazio()],
              })
            }
            onRemove={(index) =>
              updateFormData({
                objetivos: formData.objetivos.filter((_, i) => i !== index),
              })
            }
            onChange={(index, objetivo) =>
              updateFormData({
                objetivos: formData.objetivos.map((o, i) =>
                  i === index ? objetivo : o,
                ),
              })
            }
          />
        )}

        {currentStep.id === "societario" && (
          <StepSocietario
            temParticipacaoSocietaria={formData.temParticipacaoSocietaria}
            valorParticipacao={formData.valorParticipacao}
            errors={errors}
            onTemParticipacaoSocietariaChange={(temParticipacaoSocietaria) =>
              updateFormData({ temParticipacaoSocietaria })
            }
            onValorParticipacaoChange={(valorParticipacao) =>
              updateFormData({ valorParticipacao })
            }
          />
        )}

        {currentStep.id === "aposentadoria" && (
          <StepAposentadoria
            idade={formData.idade}
            idadeAposentadoria={formData.idadeAposentadoria}
            expectativaVida={formData.expectativaVida}
            pretensaoSalarialAposentadoria={
              formData.pretensaoSalarialAposentadoria
            }
            errors={errors}
            onIdadeAposentadoriaChange={(idadeAposentadoria) =>
              updateFormData({ idadeAposentadoria })
            }
            onExpectativaVidaChange={(expectativaVida) =>
              updateFormData({ expectativaVida })
            }
            onPretensaoSalarialAposentadoriaChange={(
              pretensaoSalarialAposentadoria,
            ) => updateFormData({ pretensaoSalarialAposentadoria })}
          />
        )}

        {currentStep.id === "planos-futuros" && (
          <StepPlanosFuturos
            pretendeAdquirirBens={formData.pretendeAdquirirBens}
            onPretendeAdquirirBensChange={(pretendeAdquirirBens) =>
              updateFormData({ pretendeAdquirirBens })
            }
          />
        )}

        {submitError && (
          <p className="mt-6 text-sm text-red-600">{submitError}</p>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep || isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar cliente"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isPending}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Próxima
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
