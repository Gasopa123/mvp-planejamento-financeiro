// Exportação local do Modo Apresentação em HTML. Tudo roda no navegador do
// assessor: nada aqui faz rede, lê cookie/storage ou guarda o arquivo.
// Funções puras (sem DOM real) para dar pra testar em node.

type Regra = { cssText: string };
type Folha = { href: string | null; readonly cssRules: ArrayLike<Regra> };

export function nomeArquivoApresentacao(nomeCliente: string) {
  const slug = nomeCliente
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `plano-financeiro-${slug || "cliente"}.html`;
}

// url() relativa no CSS quebraria fora do app (o arquivo baixado não tem a
// mesma origem). data:, blob:, absolutas, //host e #fragmento ficam como estão.
export function absolutizarUrlsCss(css: string, baseFolha: string) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (original, _aspas, valor: string) => {
    const v = valor.trim();
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(v)) return original;
    try {
      return `url("${new URL(v, baseFolha).href}")`;
    } catch {
      return original;
    }
  });
}

// Cada folha isolada: uma inacessível (SecurityError de outra origem) não
// derruba as outras. ok=false quando não sobrou CSS pra um arquivo legível.
export function coletarCss(folhas: Iterable<Folha>, baseDocumento: string) {
  const partes: string[] = [];
  for (const folha of folhas) {
    let regras: ArrayLike<Regra>;
    try {
      regras = folha.cssRules;
    } catch {
      continue;
    }
    const texto = Array.from(regras, (r) => r.cssText).join("\n");
    if (texto) partes.push(absolutizarUrlsCss(texto, folha.href ?? baseDocumento));
  }
  const css = partes.join("\n");
  return { css, ok: css.trim().length > 0 };
}

// Tira do clone os controles (Voltar, botões, mensagens) e qualquer script.
export function limparClone(raiz: {
  querySelectorAll(seletor: string): Iterable<{ remove(): void }>;
}) {
  for (const el of raiz.querySelectorAll("[data-export-ignore], script")) el.remove();
}

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function montarDocumentoApresentacao({
  nomeCliente,
  css,
  conteudo,
  classeHtml,
  classeBody,
}: {
  nomeCliente: string;
  css: string;
  conteudo: string;
  classeHtml: string;
  classeBody: string;
}) {
  // "<" escapado como \3c no CSS: nem "</style>" nem "<script" sobrevivem.
  const cssSeguro = css.replace(/</g, "\\3c ");
  const corpo = conteudo.replace(/<script\b[\s\S]*?(?:<\/script>|$)/gi, "");
  return [
    "<!doctype html>",
    `<html lang="pt-BR" class="${escaparHtml(classeHtml)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>Plano financeiro — ${escaparHtml(nomeCliente)}</title>`,
    `<style>${cssSeguro}</style>`,
    "</head>",
    // bg-canvas p-6 faz o papel do <main> do layout da carteira, que
    // compensa o -m-6 do root da Apresentação.
    `<body class="${escaparHtml(classeBody)}"><div class="bg-canvas p-6">${corpo}</div></body>`,
    "</html>",
  ].join("\n");
}
