import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Cliente, Objetivo } from "@/lib/types/cliente";
import { ObjetivosTab } from "./objetivos-tab";

const cliente = {
  id: "client-1",
  renda_mensal: 10000,
  despesa_mensal: 5000,
  patrimonio_investido: 50000,
} as Cliente;

const objetivos = [
  {
    id: "obj-1",
    client_id: "client-1",
    prazo: "curto",
    descricao: "Reserva para viagem",
    valor_estimado: 12000,
    horizonte_anos: 1,
  },
] satisfies Objetivo[];

describe("ObjetivosTab", () => {
  it("permite adicionar objetivo e mostra impacto na capacidade e patrimônio", () => {
    const html = renderToStaticMarkup(
      createElement(ObjetivosTab, { objetivos, assumptions: null, cliente }),
    );

    expect(html).toContain("Adicionar objetivo");
    expect(html).toContain("Impacto dos objetivos");
    expect(html).toContain("Capacidade após objetivos");
    expect(html).toContain("Patrimônio após objetivos");
    expect(html).toContain("Remover objetivo");
    expect(html).toContain('name="objetivoId" value="obj-1"');
  });
});
