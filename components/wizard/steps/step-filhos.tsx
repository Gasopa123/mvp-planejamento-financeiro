import { PessoaFields } from "../pessoa-fields";
import type { PessoaDraft } from "@/lib/wizard/types";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepFilhosProps = {
  filhos: PessoaDraft[];
  errors: StepErrors;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, filho: PessoaDraft) => void;
};

export function StepFilhos({
  filhos,
  errors,
  onAdd,
  onRemove,
  onChange,
}: StepFilhosProps) {
  return (
    <div className="space-y-4">
      {filhos.length === 0 && (
        <p className="text-sm text-ink-60">
          Nenhum filho cadastrado ainda.
        </p>
      )}

      {filhos.map((filho, index) => (
        <div
          key={index}
          className="rounded-card-sm border border-line bg-canvas p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-navy">
              Filho(a) {index + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-sm font-semibold text-danger hover:underline"
            >
              Remover
            </button>
          </div>

          <div className="mt-3">
            <PessoaFields
              idPrefix={`filho-${index}`}
              nomeLabel="Nome"
              nome={filho.nome}
              dataNascimento={filho.dataNascimento}
              dependente={filho.dependente}
              errors={{
                nome: errors[`${index}.nome`],
                dataNascimento: errors[`${index}.dataNascimento`],
                dependente: errors[`${index}.dependente`],
              }}
              onNomeChange={(nome) => onChange(index, { ...filho, nome })}
              onDataNascimentoChange={(dataNascimento) =>
                onChange(index, { ...filho, dataNascimento })
              }
              onDependenteChange={(dependente) =>
                onChange(index, { ...filho, dependente })
              }
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-blue-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        + Adicionar filho
      </button>
    </div>
  );
}
