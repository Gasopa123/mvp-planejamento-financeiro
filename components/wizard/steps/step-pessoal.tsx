import {
  ESTADO_CIVIL_LABELS,
  ESTADO_CIVIL_OPTIONS,
  type EstadoCivil,
} from "@/lib/wizard/schema";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepPessoalProps = {
  nome: string;
  idade: number | null;
  estadoCivil: EstadoCivil | "";
  errors: StepErrors;
  onNomeChange: (value: string) => void;
  onIdadeChange: (value: number | null) => void;
  onEstadoCivilChange: (value: EstadoCivil | "") => void;
};

export function StepPessoal({
  nome,
  idade,
  estadoCivil,
  errors,
  onNomeChange,
  onIdadeChange,
  onEstadoCivilChange,
}: StepPessoalProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="nome" className={labelClass}>
          Nome
        </label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(event) => onNomeChange(event.target.value)}
          className={inputClass(Boolean(errors.nome))}
        />
        {errors.nome && <p className={errorTextClass}>{errors.nome}</p>}
      </div>

      <div>
        <label htmlFor="idade" className={labelClass}>
          Idade
        </label>
        <input
          id="idade"
          type="number"
          min={0}
          max={130}
          value={idade ?? ""}
          onChange={(event) =>
            onIdadeChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className={inputClass(Boolean(errors.idade))}
        />
        {errors.idade && <p className={errorTextClass}>{errors.idade}</p>}
      </div>

      <div>
        <label htmlFor="estadoCivil" className={labelClass}>
          Estado civil
        </label>
        <select
          id="estadoCivil"
          value={estadoCivil}
          onChange={(event) =>
            onEstadoCivilChange(event.target.value as EstadoCivil | "")
          }
          className={inputClass(Boolean(errors.estadoCivil))}
        >
          <option value="">Selecione...</option>
          {ESTADO_CIVIL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {ESTADO_CIVIL_LABELS[option]}
            </option>
          ))}
        </select>
        {errors.estadoCivil && (
          <p className={errorTextClass}>{errors.estadoCivil}</p>
        )}
      </div>
    </div>
  );
}
