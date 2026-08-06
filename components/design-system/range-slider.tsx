type RangeSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
  hint?: string;
};

// Slider interativo (reference .slider-card/.range-input/.slider-value),
// usado na aba Simulações pra aporte mensal, rentabilidade real e renda desejada.
export function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  hint,
}: RangeSliderProps) {
  return (
    <div className="flex flex-col">
      <span className="text-[12.5px] font-semibold text-ink-60">{label}</span>
      <div className="my-2.5 flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
          className="range-input"
        />
        <span className="min-w-[86px] text-right font-display text-lg font-semibold text-navy">
          {formatValue(value)}
        </span>
      </div>
      {hint && <span className="text-xs text-ink-40">{hint}</span>}
    </div>
  );
}
