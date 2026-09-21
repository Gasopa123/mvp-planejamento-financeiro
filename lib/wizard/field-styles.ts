// Classes Tailwind compartilhadas pelos campos do wizard, pra manter os
// ~10 componentes de etapa consistentes sem repetir a mesma string enorme
// em cada input. A receita é a do card FormField do design system:
// label ink-60, borda field-line, foco blue, inválido e erro em danger.
// Valor digitado em 16px (body-base): abaixo disso o iOS dá zoom ao focar.

export const labelClass = "block text-sm font-semibold text-ink-60";

export function inputClass(invalid?: boolean) {
  return `mt-1 w-full rounded-xl border px-3 py-2 text-base text-ink focus:outline-none focus:ring-1 ${
    invalid
      ? "border-danger focus:border-danger focus:ring-danger"
      : "border-field-line focus:border-blue focus:ring-blue"
  }`;
}

export const errorTextClass = "mt-1 text-sm text-danger";
