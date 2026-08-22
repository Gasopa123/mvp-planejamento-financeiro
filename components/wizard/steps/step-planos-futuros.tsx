import { SimNaoField } from "../sim-nao-field";

type StepPlanosFuturosProps = {
  pretendeAdquirirBens: boolean;
  temSeguroVida: boolean;
  onPretendeAdquirirBensChange: (value: boolean) => void;
  onTemSeguroVidaChange: (value: boolean) => void;
};

export function StepPlanosFuturos({
  pretendeAdquirirBens,
  temSeguroVida,
  onPretendeAdquirirBensChange,
  onTemSeguroVidaChange,
}: StepPlanosFuturosProps) {
  return (
    <div className="space-y-4">
      <SimNaoField
        label="Pretende adquirir outros imóveis/automóveis?"
        name="pretendeAdquirirBens"
        value={pretendeAdquirirBens}
        onChange={onPretendeAdquirirBensChange}
      />

      <SimNaoField
        label="Tem seguro de vida?"
        name="temSeguroVida"
        value={temSeguroVida}
        onChange={onTemSeguroVidaChange}
      />
    </div>
  );
}
