import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ClientWizard, stepperChipClass } from "./client-wizard";

// O wizard é client component: depende do router e da server action de criação.
// Os dois são substituídos aqui porque o teste olha só o visual do casco.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
}));
vi.mock("@/app/carteira/novo/actions", () => ({
  createClienteCompleto: async () => ({ ok: true }),
}));

describe("stepperChipClass", () => {
  it("dá um estado visual distinto para etapa atual, concluída e futura", () => {
    expect(stepperChipClass(1, 1)).toBe("bg-navy text-white");
    expect(stepperChipClass(0, 1)).toBe("bg-green-soft text-green-ink-strong");
    expect(stepperChipClass(2, 1)).toBe("bg-track text-ink-60");
  });
});

describe("ClientWizard", () => {
  const html = renderToStaticMarkup(createElement(ClientWizard));

  it("usa o card do design system, com padding menor no mobile", () => {
    expect(html).toContain(
      "rounded-card border border-line bg-white p-5 shadow-brand-sm sm:p-8",
    );
    expect(html).toContain("mb-6 font-display text-2xl font-semibold text-navy");
  });

  it("marca a etapa atual no stepper e não mostra etapa concluída na primeira", () => {
    expect(html).toContain('aria-current="step"');
    expect(html).toContain("bg-navy text-white");
    expect(html).toContain("bg-track text-ink-60");
    expect(html).not.toContain("bg-green-soft text-green-ink-strong");
  });

  it("traz o avanço como pílula navy e o retorno como pílula de contorno desabilitada", () => {
    expect(html).toContain(
      "rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white",
    );
    expect(html).toContain(
      "rounded-full border border-line px-5 py-2 text-sm font-semibold text-navy",
    );
    expect(html).toContain("Próxima");
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Anterior<\/button>/);
  });
});
