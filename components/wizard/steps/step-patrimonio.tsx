import { PropriedadeList } from "../propriedade-list";
import { formatarMoeda } from "@/lib/format";
import { scopeErrors, type StepErrors } from "@/lib/wizard/validate-step";
import type { PropriedadeDraft } from "@/lib/wizard/types";

type StepPatrimonioProps = {
  imoveis: PropriedadeDraft[];
  automoveis: PropriedadeDraft[];
  errors: StepErrors;
  onAddImovel: () => void;
  onRemoveImovel: (index: number) => void;
  onChangeImovel: (index: number, item: PropriedadeDraft) => void;
  onAddAutomovel: () => void;
  onRemoveAutomovel: (index: number) => void;
  onChangeAutomovel: (index: number, item: PropriedadeDraft) => void;
};

export function StepPatrimonio({
  imoveis,
  automoveis,
  errors,
  onAddImovel,
  onRemoveImovel,
  onChangeImovel,
  onAddAutomovel,
  onRemoveAutomovel,
  onChangeAutomovel,
}: StepPatrimonioProps) {
  return (
    <div className="space-y-8">
      <PropriedadeList
        idPrefix="imovel"
        titulo="Imóveis"
        itemLabel="Imóvel"
        addLabel="+ Adicionar imóvel"
        emptyLabel="Nenhum imóvel cadastrado ainda."
        items={imoveis}
        errors={scopeErrors(errors, "imoveis")}
        onAdd={onAddImovel}
        onRemove={onRemoveImovel}
        onChange={onChangeImovel}
      />

      <PropriedadeList
        idPrefix="automovel"
        titulo="Automóveis"
        itemLabel="Automóvel"
        addLabel="+ Adicionar automóvel"
        emptyLabel="Nenhum automóvel cadastrado ainda."
        items={automoveis}
        errors={scopeErrors(errors, "automoveis")}
        onAdd={onAddAutomovel}
        onRemove={onRemoveAutomovel}
        onChange={onChangeAutomovel}
      />

      <ResumoPatrimonio imoveis={imoveis} automoveis={automoveis} />
    </div>
  );
}

export type ResumoPatrimonioValores = {
  totalImoveis: number;
  totalAutomoveis: number;
  totalBens: number;
  quantidadeFinanciados: number;
};

function somarValores(itens: PropriedadeDraft[]): number {
  return itens.reduce((total, item) => total + (item.valor ?? 0), 0);
}

function contarFinanciados(itens: PropriedadeDraft[]): number {
  return itens.filter((item) => item.financiado).length;
}

/** Resumo do patrimônio: totais por tipo, total geral e quantidade de bens financiados. */
export function resumirPatrimonio(
  imoveis: PropriedadeDraft[],
  automoveis: PropriedadeDraft[],
): ResumoPatrimonioValores {
  const totalImoveis = somarValores(imoveis);
  const totalAutomoveis = somarValores(automoveis);

  return {
    totalImoveis,
    totalAutomoveis,
    totalBens: totalImoveis + totalAutomoveis,
    quantidadeFinanciados:
      contarFinanciados(imoveis) + contarFinanciados(automoveis),
  };
}

function ResumoPatrimonio({
  imoveis,
  automoveis,
}: {
  imoveis: PropriedadeDraft[];
  automoveis: PropriedadeDraft[];
}) {
  const resumo = resumirPatrimonio(imoveis, automoveis);

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
      <p>
        Total em imóveis:{" "}
        <span className="font-medium">{formatarMoeda(resumo.totalImoveis)}</span>
      </p>
      <p>
        Total em automóveis:{" "}
        <span className="font-medium">
          {formatarMoeda(resumo.totalAutomoveis)}
        </span>
      </p>
      <p>
        Total em bens cadastrados:{" "}
        <span className="font-medium">{formatarMoeda(resumo.totalBens)}</span>
      </p>
      <p>
        Bens financiados:{" "}
        <span className="font-medium">{resumo.quantidadeFinanciados}</span>
      </p>
    </div>
  );
}
