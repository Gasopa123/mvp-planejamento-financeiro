import {
  ESTADO_CIVIL_LABELS,
  ESTADO_CIVIL_OPTIONS,
  type EstadoCivil,
} from "@/lib/wizard/schema";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";
import { SimNaoField } from "../sim-nao-field";

type StepPessoalProps = {
  nome: string;
  dataNascimento: string;
  profissao: string;
  eClt: boolean;
  estadoCivil: EstadoCivil | "";
  errors: StepErrors;
  onNomeChange: (value: string) => void;
  onDataNascimentoChange: (value: string) => void;
  onProfissaoChange: (value: string) => void;
  onECltChange: (value: boolean) => void;
  onEstadoCivilChange: (value: EstadoCivil | "") => void;
};

export function StepPessoal({
  nome,
  dataNascimento,
  profissao,
  eClt,
  estadoCivil,
  errors,
  onNomeChange,
  onDataNascimentoChange,
  onProfissaoChange,
  onECltChange,
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
        <label htmlFor="dataNascimento" className={labelClass}>
          Data de nascimento
        </label>
        <input
          id="dataNascimento"
          type="date"
          value={dataNascimento}
          onChange={(event) => onDataNascimentoChange(event.target.value)}
          className={inputClass(Boolean(errors.dataNascimento))}
        />
        {errors.dataNascimento && (
          <p className={errorTextClass}>{errors.dataNascimento}</p>
        )}
      </div>

      <div>
        <label htmlFor="profissao" className={labelClass}>
          Profissão
        </label>
        <input
          id="profissao"
          type="text"
          value={profissao}
          onChange={(event) => onProfissaoChange(event.target.value)}
          className={inputClass(Boolean(errors.profissao))}
        />
        {errors.profissao && <p className={errorTextClass}>{errors.profissao}</p>}
      </div>

      <SimNaoField
        label="É CLT?"
        name="eClt"
        value={eClt}
        onChange={onECltChange}
      />

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
