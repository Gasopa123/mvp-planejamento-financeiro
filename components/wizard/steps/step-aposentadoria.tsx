import { CurrencyInput } from "../currency-input";
import { formatarMoeda } from "@/lib/format";
import { errorTextClass, inputClass, labelClass } from "@/lib/wizard/field-styles";
import type { StepErrors } from "@/lib/wizard/validate-step";

type StepAposentadoriaProps = {
  idade: number | null;
  idadeAposentadoria: number | null;
  expectativaVida: number | null;
  pretensaoSalarialAposentadoria: number | null;
  errors: StepErrors;
  onIdadeAposentadoriaChange: (value: number | null) => void;
  onExpectativaVidaChange: (value: number | null) => void;
  onPretensaoSalarialAposentadoriaChange: (value: number | null) => void;
};

export type ResumoAposentadoria = {
  idadeAtual: number;
  idadeAlvo: number;
  tempoRestante: number;
  expectativaVida: number;
  anosPosAposentadoria: number;
  pretensaoMensalFormatada: string;
};

/** Resumo simples da aposentadoria; null se faltar algum dado necessário. */
export function resumirAposentadoria(
  idade: number | null,
  idadeAposentadoria: number | null,
  expectativaVida: number | null,
  pretensaoSalarialAposentadoria: number | null,
): ResumoAposentadoria | null {
  if (
    idade == null ||
    idadeAposentadoria == null ||
    expectativaVida == null ||
    pretensaoSalarialAposentadoria == null
  ) {
    return null;
  }

  return {
    idadeAtual: idade,
    idadeAlvo: idadeAposentadoria,
    tempoRestante: Math.max(0, idadeAposentadoria - idade),
    expectativaVida,
    anosPosAposentadoria: Math.max(0, expectativaVida - idadeAposentadoria),
    pretensaoMensalFormatada: formatarMoeda(pretensaoSalarialAposentadoria),
  };
}

export function StepAposentadoria({
  idade,
  idadeAposentadoria,
  expectativaVida,
  pretensaoSalarialAposentadoria,
  errors,
  onIdadeAposentadoriaChange,
  onExpectativaVidaChange,
  onPretensaoSalarialAposentadoriaChange,
}: StepAposentadoriaProps) {
  const resumo = resumirAposentadoria(
    idade,
    idadeAposentadoria,
    expectativaVida,
    pretensaoSalarialAposentadoria,
  );

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

      {resumo && <ResumoAposentadoriaCard resumo={resumo} />}
    </div>
  );
}

function ResumoAposentadoriaCard({ resumo }: { resumo: ResumoAposentadoria }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      <p>
        Idade atual: <span className="font-medium">{resumo.idadeAtual}</span>
      </p>
      <p>
        Idade alvo de aposentadoria:{" "}
        <span className="font-medium">{resumo.idadeAlvo}</span>
      </p>
      <p>
        Tempo restante até a aposentadoria:{" "}
        <span className="font-medium">{resumo.tempoRestante} anos</span>
      </p>
      <p>
        Expectativa de vida:{" "}
        <span className="font-medium">{resumo.expectativaVida}</span>
      </p>
      <p>
        Anos estimados vivendo de renda pós-aposentadoria:{" "}
        <span className="font-medium">{resumo.anosPosAposentadoria} anos</span>
      </p>
      <p>
        Pretensão mensal:{" "}
        <span className="font-medium">{resumo.pretensaoMensalFormatada}</span>
      </p>
    </div>
  );
}
