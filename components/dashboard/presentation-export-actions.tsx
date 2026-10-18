"use client";

import { useState } from "react";
import {
  coletarCss,
  limparClone,
  montarDocumentoApresentacao,
  nomeArquivoApresentacao,
} from "@/lib/presentation-export";

const botaoClass =
  "rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-blue-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-50";

// Botões do Modo Apresentação. O HTML é montado e baixado aqui mesmo, no
// navegador; o PDF é o "Salvar como PDF" do diálogo de impressão. Nada vai
// para o servidor.
export function PresentationExportActions({ nomeCliente }: { nomeCliente: string }) {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  function exportarHtml() {
    setErro(null);
    setAviso(null);
    setGerando(true);
    try {
      const raiz = document.querySelector("[data-export-root]");
      const { css, ok } = coletarCss(Array.from(document.styleSheets), document.baseURI);
      if (!raiz || !ok) {
        setErro("Não foi possível montar o arquivo HTML desta apresentação.");
        return;
      }
      const clone = raiz.cloneNode(true) as Element;
      limparClone(clone);
      const html = montarDocumentoApresentacao({
        nomeCliente,
        css,
        conteudo: clone.outerHTML,
        classeHtml: document.documentElement.className,
        classeBody: document.body.className,
      });
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivoApresentacao(nomeCliente);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Revoga depois que o navegador pegou o download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setAviso("Arquivo HTML gerado.");
    } catch {
      setErro("Não foi possível gerar o arquivo HTML. Tente novamente.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <>
      <button type="button" onClick={exportarHtml} disabled={gerando} className={botaoClass}>
        {gerando ? "Gerando HTML..." : "Exportar HTML"}
      </button>
      <button type="button" onClick={() => window.print()} className={botaoClass}>
        Exportar PDF
      </button>
      {erro && (
        <p role="alert" className="basis-full text-right text-sm text-danger">
          {erro}
        </p>
      )}
      {aviso && (
        <p role="status" className="basis-full text-right text-sm text-ink-60">
          {aviso}
        </p>
      )}
    </>
  );
}
