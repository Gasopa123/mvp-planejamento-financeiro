import type { ReactNode } from "react";
import { Card } from "@/components/design-system/card";

// Moldura das telas de entrada (login, cadastro, redefinir senha). O canvas
// "Dashboard — MVP Planejamento Financeiro" não tem artboard de auth; isto é
// a tradução dele: no desktop, o painel navy com a marca do rail (ponto gold
// de 7px + nome em Fraunces 15px); no celular, o cabeçalho branco de 68px do
// Mobile-Home. O formulário fica no mesmo card branco dos dashboards.

// Receitas das três telas. Ficam aqui, e não num Button, porque só a
// moldura de auth as usa por enquanto.
const focoVisivel =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

export const authPrimaryButtonClass = `h-12 w-full rounded-full bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-2 disabled:cursor-not-allowed disabled:opacity-50 ${focoVisivel}`;
export const authLinkClass = `rounded-sm font-medium text-ink-60 hover:text-navy ${focoVisivel}`;
export const authInlineLinkClass = `rounded-sm font-semibold text-blue hover:text-navy ${focoVisivel}`;
export const authErrorClass =
  "rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger";
export const authSuccessClass =
  "rounded-xl border border-green-line bg-green-soft px-4 py-3 text-sm text-green-ink-strong";

function Marca({ className }: { className: string }) {
  return (
    <div className="flex items-center gap-[9px]">
      <span aria-hidden="true" className="size-[7px] flex-none rounded-full bg-gold" />
      <span
        className={`font-display text-[15px] font-semibold tracking-[0.02em] ${className}`}
      >
        Planejamento Financeiro
      </span>
    </div>
  );
}

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-canvas lg:flex-row">
      <aside className="hidden flex-none flex-col justify-between bg-navy px-12 py-10 lg:flex lg:w-2/5 xl:max-w-xl">
        <Marca className="text-white" />
        <p className="max-w-sm font-display text-4xl leading-tight font-semibold text-white">
          Wealth planning para assessores financeiros
        </p>
      </aside>

      <header className="flex h-[68px] flex-none items-center border-b border-line bg-white px-5 lg:hidden">
        <Marca className="text-navy" />
      </header>

      <main className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 lg:items-center lg:px-10 lg:py-12">
        <Card className="w-full max-w-md">
          <h1 className="font-display text-3xl font-semibold text-navy">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-60">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </Card>
      </main>
    </div>
  );
}
