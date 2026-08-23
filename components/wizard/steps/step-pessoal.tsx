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
  esporteFavorito: string;
  hobbies: string;
  temSeguroVida: boolean;
  pesoKg: number | null;
  alturaCm: number | null;
  possuiPatologia: boolean;
  patologias: string;
  usaMedicamentos: boolean;
  medicamentos: string;
  fuma: boolean;
  andaMoto: boolean;
  frequenciaMoto: string;
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
  onEsporteFavoritoChange: (value: string) => void;
  onHobbiesChange: (value: string) => void;
  onTemSeguroVidaChange: (value: boolean) => void;
  onPesoKgChange: (value: number | null) => void;
  onAlturaCmChange: (value: number | null) => void;
  onPossuiPatologiaChange: (value: boolean) => void;
  onPatologiasChange: (value: string) => void;
  onUsaMedicamentosChange: (value: boolean) => void;
  onMedicamentosChange: (value: string) => void;
  onFumaChange: (value: boolean) => void;
  onAndaMotoChange: (value: boolean) => void;
  onFrequenciaMotoChange: (value: string) => void;
};

export function StepPessoal({
  nome,
  dataNascimento,
  profissao,
  eClt,
  estadoCivil,
  conjuge,
  filhos,
  esporteFavorito,
  hobbies,
  temSeguroVida,
  pesoKg,
  alturaCm,
  possuiPatologia,
  patologias,
  usaMedicamentos,
  medicamentos,
  fuma,
  andaMoto,
  frequenciaMoto,
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
  onEsporteFavoritoChange,
  onHobbiesChange,
  onTemSeguroVidaChange,
  onPesoKgChange,
  onAlturaCmChange,
  onPossuiPatologiaChange,
  onPatologiasChange,
  onUsaMedicamentosChange,
  onMedicamentosChange,
  onFumaChange,
  onAndaMotoChange,
  onFrequenciaMotoChange,
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

      <div className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Estilo de vida
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="esporteFavorito" className={labelClass}>
              Esporte favorito
            </label>
            <input
              id="esporteFavorito"
              type="text"
              value={esporteFavorito}
              onChange={(event) => onEsporteFavoritoChange(event.target.value)}
              className={inputClass()}
            />
          </div>

          <div>
            <label htmlFor="hobbies" className={labelClass}>
              Hobbies
            </label>
            <textarea
              id="hobbies"
              rows={3}
              value={hobbies}
              onChange={(event) => onHobbiesChange(event.target.value)}
              className={inputClass()}
            />
          </div>

          <SimNaoField
            label="Tem seguro de vida?"
            name="temSeguroVida"
            value={temSeguroVida}
            onChange={onTemSeguroVidaChange}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Saúde e risco
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pesoKg" className={labelClass}>
                Peso (kg)
              </label>
              <input
                id="pesoKg"
                type="number"
                min={0}
                step="0.1"
                value={pesoKg ?? ""}
                onChange={(event) =>
                  onPesoKgChange(
                    event.target.value === "" ? null : Number(event.target.value),
                  )
                }
                className={inputClass(Boolean(errors.pesoKg))}
              />
              {errors.pesoKg && (
                <p className={errorTextClass}>{errors.pesoKg}</p>
              )}
            </div>

            <div>
              <label htmlFor="alturaCm" className={labelClass}>
                Altura (cm)
              </label>
              <input
                id="alturaCm"
                type="number"
                min={0}
                value={alturaCm ?? ""}
                onChange={(event) =>
                  onAlturaCmChange(
                    event.target.value === "" ? null : Number(event.target.value),
                  )
                }
                className={inputClass(Boolean(errors.alturaCm))}
              />
              {errors.alturaCm && (
                <p className={errorTextClass}>{errors.alturaCm}</p>
              )}
            </div>
          </div>

          <SimNaoField
            label="Possui patologia?"
            name="possuiPatologia"
            value={possuiPatologia}
            onChange={(value) => {
              onPossuiPatologiaChange(value);
              if (!value) onPatologiasChange("");
            }}
          />
          {possuiPatologia && (
            <div>
              <label htmlFor="patologias" className={labelClass}>
                Quais patologias?
              </label>
              <textarea
                id="patologias"
                rows={2}
                value={patologias}
                onChange={(event) => onPatologiasChange(event.target.value)}
                className={inputClass(Boolean(errors.patologias))}
              />
              {errors.patologias && (
                <p className={errorTextClass}>{errors.patologias}</p>
              )}
            </div>
          )}

          <SimNaoField
            label="Usa medicamentos?"
            name="usaMedicamentos"
            value={usaMedicamentos}
            onChange={(value) => {
              onUsaMedicamentosChange(value);
              if (!value) onMedicamentosChange("");
            }}
          />
          {usaMedicamentos && (
            <div>
              <label htmlFor="medicamentos" className={labelClass}>
                Quais medicamentos?
              </label>
              <textarea
                id="medicamentos"
                rows={2}
                value={medicamentos}
                onChange={(event) => onMedicamentosChange(event.target.value)}
                className={inputClass(Boolean(errors.medicamentos))}
              />
              {errors.medicamentos && (
                <p className={errorTextClass}>{errors.medicamentos}</p>
              )}
            </div>
          )}

          <SimNaoField
            label="Fuma?"
            name="fuma"
            value={fuma}
            onChange={onFumaChange}
          />

          <SimNaoField
            label="Anda de moto?"
            name="andaMoto"
            value={andaMoto}
            onChange={(value) => {
              onAndaMotoChange(value);
              if (!value) onFrequenciaMotoChange("");
            }}
          />
          {andaMoto && (
            <div>
              <label htmlFor="frequenciaMoto" className={labelClass}>
                Com que frequência?
              </label>
              <input
                id="frequenciaMoto"
                type="text"
                value={frequenciaMoto}
                onChange={(event) =>
                  onFrequenciaMotoChange(event.target.value)
                }
                className={inputClass(Boolean(errors.frequenciaMoto))}
              />
              {errors.frequenciaMoto && (
                <p className={errorTextClass}>{errors.frequenciaMoto}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
