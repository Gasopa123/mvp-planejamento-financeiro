import { PessoaFields } from "../pessoa-fields";
import type { PessoaDraft } from "@/lib/wizard/types";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepConjugeProps = {
  conjuge: PessoaDraft;
  errors: StepErrors;
  onChange: (conjuge: PessoaDraft) => void;
};

export function StepConjuge({ conjuge, errors, onChange }: StepConjugeProps) {
  return (
    <PessoaFields
      idPrefix="conjuge"
      nomeLabel="Nome do cônjuge"
      nome={conjuge.nome}
      dataNascimento={conjuge.dataNascimento}
      dependente={conjuge.dependente}
      errors={errors}
      onNomeChange={(nome) => onChange({ ...conjuge, nome })}
      onDataNascimentoChange={(dataNascimento) =>
        onChange({ ...conjuge, dataNascimento })
      }
      onDependenteChange={(dependente) => onChange({ ...conjuge, dependente })}
    />
  );
}
