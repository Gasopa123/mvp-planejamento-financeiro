import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import CarteiraLayout from "./layout";

// LogoutButton usa o router; aqui interessa só onde ele é renderizado.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
}));

describe("CarteiraLayout", () => {
  const html = renderToStaticMarkup(<CarteiraLayout>conteúdo</CarteiraLayout>);

  it("esconde o cabeçalho com marca e logout na impressão", () => {
    expect(html).toMatch(/<header[^>]*print:hidden/);
    expect(html).toContain("Sair");
  });

  it("zera o padding externo do conteúdo na impressão", () => {
    expect(html).toMatch(/<main[^>]*print:p-0/);
  });
});
