import {
  ESTADO_CIVIL_LABELS,
  ESTADO_CIVIL_OPTIONS,
  ESTADOS_CIVIS_COM_CONJUGE,
  type EstadoCivil,
} from "@/lib/wizard/schema";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import { scopeErrors, type StepErrors } from "@/lib/wizard/validate-step";
import type { PessoaDraft } from "@/lib/wizard/types";
import { SimNaoField } from "../sim-nao-field";
import { PessoaFields } from "../pessoa-fields";

type StepPessoalProps = {
  nome: string;
  dataNascimento: string;
  profissao: string;
  eClt: boolean;
  estadoCivil: EstadoCivil | "";
  conjuge: PessoaDraft;
  filhos: PessoaDraft[];
  errors: StepErrors;
  onNomeChange: (value: string) => void;
  onDataNascimentoChange: (value: string) => void;
  onProfissaoChange: (value: string) => void;
  onECltChange: (value: boolean) => void;
  onEstadoCivilChange: (value: EstadoCivil | "") => void;
  onConjugeChange: (conjuge: PessoaDraft) => void;
  onAddFilho: () => void;
  onRemoveFilho: (index: number) => void;
  onChangeFilho: (index: number, filho: PessoaDraft) => void;
};

export function StepPessoal({
  nome,
  dataNascimento,
  profissao,
  eClt,
  estadoCivil,
  conjuge,
  filhos,
  errors,
  onNomeChange,
  onDataNascimentoChange,
  onProfissaoChange,
  onECltChange,
  onEstadoCivilChange,
  onConjugeChange,
  onAddFilho,
  onRemoveFilho,
  onChangeFilho,
}: StepPessoalProps) {
  const exigeConjuge =
    estadoCivil !== "" && ESTADOS_CIVIS_COM_CONJUGE.includes(estadoCivil);
  const conjugeErrors = scopeErrors(errors, "conjuge");
  const filhosErrors = scopeErrors(errors, "filhos");

  return (
    <div className="space-y-8">
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
          {errors.profissao && (
            <p className={errorTextClass}>{errors.profissao}</p>
          )}
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

      {exigeConjuge && (
        <div className="border-t border-gray-200 pt-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Cônjuge</h2>
          {errors.conjuge && (
            <p className={errorTextClass}>{errors.conjuge}</p>
          )}
          <PessoaFields
            idPrefix="conjuge"
            nomeLabel="Nome do cônjuge"
            nome={conjuge.nome}
            dataNascimento={conjuge.dataNascimento}
            dependente={conjuge.dependente}
            errors={conjugeErrors}
            onNomeChange={(nomeConjuge) =>
              onConjugeChange({ ...conjuge, nome: nomeConjuge })
            }
            onDataNascimentoChange={(dataNascimentoConjuge) =>
              onConjugeChange({ ...conjuge, dataNascimento: dataNascimentoConjuge })
            }
            onDependenteChange={(dependenteConjuge) =>
              onConjugeChange({ ...conjuge, dependente: dependenteConjuge })
            }
          />
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Filhos</h2>

        <div className="space-y-4">
          {filhos.length === 0 && (
            <p className="text-sm text-gray-600">
              Nenhum filho cadastrado ainda.
            </p>
          )}

          {filhos.map((filho, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Filho(a) {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveFilho(index)}
                  className="text-sm font-medium text-red-600 hover:underline"
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
                    nome: filhosErrors[`${index}.nome`],
                    dataNascimento: filhosErrors[`${index}.dataNascimento`],
                    dependente: filhosErrors[`${index}.dependente`],
                  }}
                  onNomeChange={(nomeFilho) =>
                    onChangeFilho(index, { ...filho, nome: nomeFilho })
                  }
                  onDataNascimentoChange={(dataNascimentoFilho) =>
                    onChangeFilho(index, {
                      ...filho,
                      dataNascimento: dataNascimentoFilho,
                    })
                  }
                  onDependenteChange={(dependenteFilho) =>
                    onChangeFilho(index, { ...filho, dependente: dependenteFilho })
                  }
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddFilho}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + Adicionar filho
          </button>
        </div>
      </div>
    </div>
  );
}
