import { inputClass, labelClass } from "@/lib/wizard/field-styles";

type StepEstiloVidaProps = {
  esporteFavorito: string;
  hobbies: string;
  onEsporteFavoritoChange: (value: string) => void;
  onHobbiesChange: (value: string) => void;
};

export function StepEstiloVida({
  esporteFavorito,
  hobbies,
  onEsporteFavoritoChange,
  onHobbiesChange,
}: StepEstiloVidaProps) {
  return (
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
    </div>
  );
}
