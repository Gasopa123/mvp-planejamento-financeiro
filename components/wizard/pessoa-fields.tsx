import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import { SimNaoField } from "./sim-nao-field";

type PessoaFieldsErrors = {
  nome?: string;
  dataNascimento?: string;
  dependente?: string;
};

type PessoaFieldsProps = {
  idPrefix: string;
  nomeLabel: string;
  nome: string;
  dataNascimento: string | null;
  dependente: boolean;
  errors?: PessoaFieldsErrors;
  onNomeChange: (value: string) => void;
  onDataNascimentoChange: (value: string | null) => void;
  onDependenteChange: (value: boolean) => void;
};

// Campos nome / data de nascimento / dependente, compartilhados entre a
// etapa Cônjuge (um registro) e a etapa Filhos (lista de registros).
export function PessoaFields({
  idPrefix,
  nomeLabel,
  nome,
  dataNascimento,
  dependente,
  errors,
  onNomeChange,
  onDataNascimentoChange,
  onDependenteChange,
}: PessoaFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`${idPrefix}-nome`} className={labelClass}>
          {nomeLabel}
        </label>
        <input
          id={`${idPrefix}-nome`}
          type="text"
          value={nome}
          onChange={(event) => onNomeChange(event.target.value)}
          className={inputClass(Boolean(errors?.nome))}
        />
        {errors?.nome && <p className={errorTextClass}>{errors.nome}</p>}
      </div>

      <div>
        <label htmlFor={`${idPrefix}-data-nascimento`} className={labelClass}>
          Data de nascimento
        </label>
        <input
          id={`${idPrefix}-data-nascimento`}
          type="date"
          value={dataNascimento ?? ""}
          onChange={(event) =>
            onDataNascimentoChange(event.target.value || null)
          }
          className={inputClass(Boolean(errors?.dataNascimento))}
        />
        {errors?.dataNascimento && (
          <p className={errorTextClass}>{errors.dataNascimento}</p>
        )}
      </div>

      <SimNaoField
        label="É dependente?"
        name={`${idPrefix}-dependente`}
        value={dependente}
        onChange={onDependenteChange}
      />
    </div>
  );
}
