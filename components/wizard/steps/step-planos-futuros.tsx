import { SimNaoField } from "../sim-nao-field";

type StepPlanosFuturosProps = {
  pretendeAdquirirBens: boolean;
  onPretendeAdquirirBensChange: (value: boolean) => void;
};

export function StepPlanosFuturos({
  pretendeAdquirirBens,
  onPretendeAdquirirBensChange,
}: StepPlanosFuturosProps) {
  return (
    <div className="space-y-4">
      <SimNaoField
        label="Pretende adquirir outros imóveis/automóveis?"
        name="pretendeAdquirirBens"
        value={pretendeAdquirirBens}
        onChange={onPretendeAdquirirBensChange}
      />
    </div>
  );
}
