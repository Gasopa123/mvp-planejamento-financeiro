import { CurrencyInput } from "../currency-input";
import { SimNaoField } from "../sim-nao-field";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepSocietarioProps = {
  temParticipacaoSocietaria: boolean;
  valorParticipacao: number | null;
  percentualParticipacao: number | null;
  errors: StepErrors;
  onTemParticipacaoSocietariaChange: (value: boolean) => void;
  onValorParticipacaoChange: (value: number | null) => void;
  onPercentualParticipacaoChange: (value: number | null) => void;
};

export function StepSocietario({
  temParticipacaoSocietaria,
  valorParticipacao,
  percentualParticipacao,
  errors,
  onTemParticipacaoSocietariaChange,
  onValorParticipacaoChange,
  onPercentualParticipacaoChange,
}: StepSocietarioProps) {
  return (
    <div className="space-y-4">
      <SimNaoField
        label="Tem participação societária?"
        name="temParticipacaoSocietaria"
        value={temParticipacaoSocietaria}
        onChange={(value) => {
          onTemParticipacaoSocietariaChange(value);
          if (!value) {
            onValorParticipacaoChange(null);
            onPercentualParticipacaoChange(null);
          }
        }}
      />

      {temParticipacaoSocietaria && (
        <>
          <div>
            <label htmlFor="valorParticipacao" className={labelClass}>
              Valor aproximado
            </label>
            <CurrencyInput
              id="valorParticipacao"
              value={valorParticipacao}
              onChange={onValorParticipacaoChange}
              invalid={Boolean(errors.valorParticipacao)}
            />
            {errors.valorParticipacao && (
              <p className={errorTextClass}>{errors.valorParticipacao}</p>
            )}
          </div>

          <div>
            <label htmlFor="percentualParticipacao" className={labelClass}>
              Percentual da participação
            </label>
            <input
              id="percentualParticipacao"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={percentualParticipacao ?? ""}
              onChange={(event) =>
                onPercentualParticipacaoChange(
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              className={inputClass(Boolean(errors.percentualParticipacao))}
            />
            {errors.percentualParticipacao && (
              <p className={errorTextClass}>{errors.percentualParticipacao}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
