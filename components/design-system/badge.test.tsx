import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("usa tintas fortes para texto pequeno verde e dourado", () => {
    const green = renderToStaticMarkup(<Badge tone="green">OK</Badge>);
    const gold = renderToStaticMarkup(<Badge tone="gold">Atenção</Badge>);

    expect(green).toContain("text-green-ink-strong");
    expect(gold).toContain("text-gold-ink-strong");
  });
});
