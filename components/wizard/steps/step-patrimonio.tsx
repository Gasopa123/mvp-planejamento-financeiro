import { PropriedadeList } from "../propriedade-list";
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
    </div>
  );
}
