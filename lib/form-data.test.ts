import { describe, expect, it } from "vitest";
import { booleano } from "./form-data";

describe("booleano", () => {
  it("salva checkbox marcado mesmo com hidden off antes", () => {
    const data = new FormData();
    data.append("e_clt", "off");
    data.append("e_clt", "on");

    expect(booleano(data, "e_clt")).toBe(true);
  });

  it("salva false quando só veio hidden off", () => {
    const data = new FormData();
    data.append("e_clt", "off");

    expect(booleano(data, "e_clt")).toBe(false);
  });
});
