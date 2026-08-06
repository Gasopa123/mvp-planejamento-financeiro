import { SimNaoField } from "../sim-nao-field";

type StepPlanosFuturosProps = {
  pretendeAdquirirBens: boolean;
  eClt: boolean;
  temSeguroVida: boolean;
  onPretendeAdquirirBensChange: (value: boolean) => void;
  onECltChange: (value: boolean) => void;
  onTemSeguroVidaChange: (value: boolean) => void;
};

export function StepPlanosFuturos({
  pretendeAdquirirBens,
  eClt,
  temSeguroVida,
  onPretendeAdquirirBensChange,
  onECltChange,
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
        label="É CLT?"
        name="eClt"
        value={eClt}
        onChange={onECltChange}
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
