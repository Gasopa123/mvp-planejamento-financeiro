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

const objetivoSemPrazo = {
  id: "obj-2",
  client_id: "client-1",
  prazo: "longo",
  descricao: "Casa na praia",
  valor_estimado: 100000,
  horizonte_anos: null,
} satisfies Objetivo;

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

  it("mostra o aporte mensal sugerido quando o objetivo tem prazo", () => {
    const html = renderToStaticMarkup(
      createElement(ObjetivosTab, { objetivos, assumptions: null, cliente }),
    );

    expect(html).toContain("Guardar por mês até a meta");
    expect(html).not.toContain("Defina um prazo");
  });

  // Regressão do bloqueio apontado na revisão: valorMensalSugeridoObjetivo usa
  // piso de 1 mês, então um objetivo de R$ 100 mil sem horizonte viraria
  // "guardar R$ 100.000,00 por mês". Sem prazo, não mostramos aporte nenhum.
  it("não sugere aporte mensal para objetivo sem prazo — pede o prazo", () => {
    const html = renderToStaticMarkup(
      createElement(ObjetivosTab, {
        objetivos: [objetivoSemPrazo],
        assumptions: null,
        cliente,
      }),
    );

    expect(html).toContain("Defina um prazo para calcular o aporte mensal sugerido.");
    expect(html).not.toContain("Guardar por mês até a meta");
    // O valor cheio da meta não pode vazar como "aporte mensal" no agregado:
    // sem prazo, o aporte mensal dos objetivos tem que ficar zerado.
    expect(html).toMatch(
      /Aporte mensal pros objetivos<\/span><b[^>]*>R\$\s*0,00</,
    );
  });

  it("deixa claro que o aporte sugerido é divisão linear, sem promessa de rentabilidade", () => {
    const html = renderToStaticMarkup(
      createElement(ObjetivosTab, { objetivos, assumptions: null, cliente }),
    );

    expect(html).toContain("divisão linear simples");
    expect(html).toContain("considera rendimento");
    expect(html).toContain("promete rentabilidade");
  });
});
