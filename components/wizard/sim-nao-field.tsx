type SimNaoFieldProps = {
  label: string;
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

// Par de rádios "Sim" / "Não" reutilizado nos vários campos booleanos
// do wizard (dependente, financiado, é CLT, tem seguro de vida, etc).
export function SimNaoField({ label, name, value, onChange }: SimNaoFieldProps) {
  return (
    <div>
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1 flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name={name}
            checked={value === true}
            onChange={() => onChange(true)}
            className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-500"
          />
          Sim
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="radio"
            name={name}
            checked={value === false}
            onChange={() => onChange(false)}
            className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-500"
          />
          Não
        </label>
      </div>
    </div>
  );
}
