import { CurrencyInput } from "../currency-input";
import { SimNaoField } from "../sim-nao-field";
import { errorTextClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepSocietarioProps = {
  temParticipacaoSocietaria: boolean;
  valorParticipacao: number | null;
  errors: StepErrors;
  onTemParticipacaoSocietariaChange: (value: boolean) => void;
  onValorParticipacaoChange: (value: number | null) => void;
};

export function StepSocietario({
  temParticipacaoSocietaria,
  valorParticipacao,
  errors,
  onTemParticipacaoSocietariaChange,
  onValorParticipacaoChange,
}: StepSocietarioProps) {
  return (
    <div className="space-y-4">
      <SimNaoField
        label="Tem participação societária?"
        name="temParticipacaoSocietaria"
        value={temParticipacaoSocietaria}
        onChange={(value) => {
          onTemParticipacaoSocietariaChange(value);
          if (!value) onValorParticipacaoChange(null);
        }}
      />

      {temParticipacaoSocietaria && (
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
      )}
    </div>
  );
}
