import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StepSocietario } from "./step-societario";

describe("StepSocietario", () => {
  it("renderiza percentual quando há participação societária", () => {
    const html = renderToStaticMarkup(
      createElement(StepSocietario, {
        temParticipacaoSocietaria: true,
        valorParticipacao: 250000,
        percentualParticipacao: 35,
        errors: {},
        onTemParticipacaoSocietariaChange: () => {},
        onValorParticipacaoChange: () => {},
        onPercentualParticipacaoChange: () => {},
      }),
    );

    expect(html).toContain("Percentual da participação");
    expect(html).toContain('value="35"');
  });
});
