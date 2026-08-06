// Classes Tailwind compartilhadas pelos campos do wizard, pra manter os
// ~10 componentes de etapa consistentes sem repetir a mesma string enorme
// em cada input.

export const labelClass = "block text-sm font-medium text-gray-700";

export function inputClass(invalid?: boolean) {
  return `mt-1 w-full rounded-md border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 ${
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
  }`;
}

export const errorTextClass = "mt-1 text-sm text-red-600";
