import type { ChangeEvent } from "react";

type PercentFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  /** Destaca o campo como o que atualmente governa o cálculo. */
  active?: boolean;
};

// Campo numérico de percentual (reference .card-label + input), usado nos
// campos independentes de rentabilidade (IPCA+, % do CDI, Prefixado) e nas
// premissas editáveis (CDI atual, inflação projetada) da aba Simulações.
export function PercentField({
  label,
  value,
  onChange,
  step = 0.01,
  active = false,
}: PercentFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const parsed = Number(event.target.value);
    onChange(Number.isNaN(parsed) ? 0 : parsed);
  }
  const displayValue = Number.isFinite(value) ? value.toFixed(2) : "0.00";

  return (
    <div>
      <label className="block text-[12.5px] font-semibold text-ink-60">
        {label}
      </label>
      <div
        className={`mt-1.5 flex items-center gap-1 rounded-md border px-3 py-2 transition-colors ${
          active ? "border-blue ring-1 ring-blue" : "border-line"
        }`}
      >
        <input
          type="number"
          step={step}
          value={displayValue}
          onChange={handleChange}
          className="w-full bg-transparent font-display text-base font-semibold text-navy outline-none"
        />
        <span className="text-sm text-ink-40">% a.a.</span>
      </div>
    </div>
  );
}
