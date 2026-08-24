import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PercentField } from "./percent-field";

describe("PercentField", () => {
  it("renderiza percentual com duas casas decimais", () => {
    const html = renderToStaticMarkup(
      createElement(PercentField, {
        label: "Prefixado",
        value: 9.040000000000002,
        onChange: () => {},
      }),
    );

    expect(html).toContain('value="9.04"');
    expect(html).not.toContain("9.040000000000002");
  });
});
