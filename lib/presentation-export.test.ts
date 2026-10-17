import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  absolutizarUrlsCss,
  coletarCss,
  limparClone,
  montarDocumentoApresentacao,
  nomeArquivoApresentacao,
} from "./presentation-export";

describe("nomeArquivoApresentacao", () => {
  it("gera nome legível, sem acento nem caractere especial", () => {
    expect(nomeArquivoApresentacao("Cliente Teste")).toBe("plano-financeiro-cliente-teste.html");
    expect(nomeArquivoApresentacao("João  da Silva/../<x>")).toBe("plano-financeiro-joao-da-silva-x.html");
  });

  it("cai num nome genérico quando não sobra nada do nome", () => {
    expect(nomeArquivoApresentacao("???")).toBe("plano-financeiro-cliente.html");
  });
});

describe("absolutizarUrlsCss", () => {
  const base = "https://app.exemplo.com/_next/static/chunks/app.css";

  it("resolve url() relativa contra a URL da própria folha", () => {
    expect(absolutizarUrlsCss('@font-face{src:url(../media/f.woff2)}', base)).toBe(
      '@font-face{src:url("https://app.exemplo.com/_next/static/media/f.woff2")}',
    );
    expect(absolutizarUrlsCss("a{b:url('/img/x.png')}", base)).toBe(
      'a{b:url("https://app.exemplo.com/img/x.png")}',
    );
  });

  it("preserva data:, blob:, absolutas e fragmentos", () => {
    const css = [
      'a{b:url("data:image/png;base64,AAA")}',
      "a{b:url(blob:https://app.exemplo.com/123)}",
      "a{b:url(https://cdn.exemplo.com/f.woff2)}",
      "a{b:url(//cdn.exemplo.com/f.woff2)}",
      "a{fill:url(#grad)}",
    ].join("");
    expect(absolutizarUrlsCss(css, base)).toBe(css);
  });
});

describe("coletarCss", () => {
  const regras = (...t: string[]) => t.map((cssText) => ({ cssText }));

  it("serializa cada folha e resolve url() com a URL dela", () => {
    const r = coletarCss(
      [
        { href: "https://app.exemplo.com/_next/static/chunks/a.css", cssRules: regras(".a{color:red}", "x{src:url(../m/f.woff2)}") },
        { href: null, cssRules: regras(".b{color:blue}") },
      ],
      "https://app.exemplo.com/carteira/1/apresentacao",
    );
    expect(r.ok).toBe(true);
    expect(r.css).toContain(".a{color:red}");
    expect(r.css).toContain('url("https://app.exemplo.com/_next/static/m/f.woff2")');
    expect(r.css).toContain(".b{color:blue}");
  });

  it("não derruba a exportação quando uma folha é inacessível", () => {
    const bloqueada = {
      href: "https://outro.exemplo.com/x.css",
      get cssRules(): { cssText: string }[] {
        throw new DOMException("bloqueada", "SecurityError");
      },
    };
    const r = coletarCss(
      [bloqueada, { href: null, cssRules: regras(".ok{color:red}") }],
      "https://app.exemplo.com/",
    );
    expect(r.ok).toBe(true);
    expect(r.css).toBe(".ok{color:red}");
  });

  it("sinaliza falha quando não há CSS legível", () => {
    expect(coletarCss([], "https://app.exemplo.com/").ok).toBe(false);
  });
});

describe("limparClone", () => {
  it("remove controles marcados e scripts do clone", () => {
    const removidos: string[] = [];
    let seletor = "";
    const el = (nome: string) => ({ remove: () => removidos.push(nome) });
    limparClone({
      querySelectorAll: (s: string) => {
        seletor = s;
        return [el("botoes"), el("script")];
      },
    });
    expect(seletor).toBe("[data-export-ignore], script");
    expect(removidos).toEqual(["botoes", "script"]);
  });
});

describe("montarDocumentoApresentacao", () => {
  const html = montarDocumentoApresentacao({
    nomeCliente: 'Ana <b>"&"</b>',
    css: ".a{color:red}</style><script>x</script>",
    conteudo: '<main data-export-root="">conteúdo<svg><path d="M0 0"/></svg><script>alert(1)</script></main>',
    classeHtml: "fonte h-full",
    classeBody: "min-h-full",
  });

  it("é um documento completo em pt-BR, UTF-8 e com viewport", () => {
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="pt-BR" class="fonte h-full">');
    expect(html).toContain('<meta charset="utf-8">');
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
  });

  it("escapa o nome do cliente no título", () => {
    expect(html).toContain(
      "<title>Plano financeiro — Ana &lt;b&gt;&quot;&amp;&quot;&lt;/b&gt;</title>",
    );
  });

  it("embute o CSS sem permitir fechar a tag style", () => {
    expect(html).toContain("<style>.a{color:red}\\3c /style>\\3c script>x\\3c /script></style>");
  });

  it("traz o conteúdo dentro da moldura que compensa o -m-6 do root", () => {
    expect(html).toContain(
      '<body class="min-h-full"><div class="bg-canvas p-6"><main data-export-root="">conteúdo<svg>',
    );
  });

  it("não contém script executável", () => {
    expect(html).not.toMatch(/<script/i);
  });
});

describe("dependências", () => {
  it("não adiciona biblioteca de PDF ou navegador headless", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(deps.filter((d) => /pdf|html2canvas|puppeteer|playwright/i.test(d))).toEqual([]);
  });
});
