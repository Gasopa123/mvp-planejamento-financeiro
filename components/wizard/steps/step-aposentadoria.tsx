import { CurrencyInput } from "../currency-input";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepAposentadoriaProps = {
  idadeAposentadoria: number | null;
  expectativaVida: number | null;
  pretensaoSalarialAposentadoria: number | null;
  errors: StepErrors;
  onIdadeAposentadoriaChange: (value: number | null) => void;
  onExpectativaVidaChange: (value: number | null) => void;
  onPretensaoSalarialAposentadoriaChange: (value: number | null) => void;
};

export function StepAposentadoria({
  idadeAposentadoria,
  expectativaVida,
  pretensaoSalarialAposentadoria,
  errors,
  onIdadeAposentadoriaChange,
  onExpectativaVidaChange,
  onPretensaoSalarialAposentadoriaChange,
}: StepAposentadoriaProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="idadeAposentadoria" className={labelClass}>
          Idade que pretende se aposentar
        </label>
        <input
          id="idadeAposentadoria"
          type="number"
          min={0}
          max={130}
          value={idadeAposentadoria ?? ""}
          onChange={(event) =>
            onIdadeAposentadoriaChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className={inputClass(Boolean(errors.idadeAposentadoria))}
        />
        {errors.idadeAposentadoria && (
          <p className={errorTextClass}>{errors.idadeAposentadoria}</p>
        )}
      </div>

      <div>
        <label htmlFor="expectativaVida" className={labelClass}>
          Expectativa de vida
        </label>
        <input
          id="expectativaVida"
          type="number"
          min={0}
          max={130}
          value={expectativaVida ?? ""}
          onChange={(event) =>
            onExpectativaVidaChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className={inputClass(Boolean(errors.expectativaVida))}
        />
        {errors.expectativaVida && (
          <p className={errorTextClass}>{errors.expectativaVida}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="pretensaoSalarialAposentadoria"
          className={labelClass}
        >
          Pretensão salarial pós-aposentadoria
        </label>
        <CurrencyInput
          id="pretensaoSalarialAposentadoria"
          value={pretensaoSalarialAposentadoria}
          onChange={onPretensaoSalarialAposentadoriaChange}
          invalid={Boolean(errors.pretensaoSalarialAposentadoria)}
        />
        {errors.pretensaoSalarialAposentadoria && (
          <p className={errorTextClass}>
            {errors.pretensaoSalarialAposentadoria}
          </p>
        )}
      </div>
    </div>
  );
}
