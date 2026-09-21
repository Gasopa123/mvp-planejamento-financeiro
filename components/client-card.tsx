"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteClient } from "@/app/carteira/actions";
import { Card, CardLabel } from "@/components/design-system/card";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const focoVisivel =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

type ClientCardProps = {
  id: string;
  nome: string;
  idade: number | null;
  patrimonioInvestido: number | null;
};

export function ClientCard({
  id,
  nome,
  idade,
  patrimonioInvestido,
}: ClientCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirmDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteClient(id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsModalOpen(false);
    });
  }

  return (
    <>
      <Card className="relative flex h-full flex-col gap-5">
        <Link
          href={`/carteira/${id}`}
          className={`absolute inset-0 z-0 rounded-card ${focoVisivel}`}
          aria-label={`Ver dashboard de ${nome}`}
        />

        <div className="pointer-events-none relative z-[1] flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-11 flex-none items-center justify-center rounded-full bg-gold font-display text-lg font-semibold text-navy"
          >
            {nome.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold break-words text-navy">
              {nome}
            </p>
            <p className="text-sm text-ink-60">
              {idade != null ? `${idade} anos` : "Idade não informada"}
            </p>
          </div>
        </div>

        <div className="pointer-events-none relative z-[1]">
          <CardLabel>Patrimônio investido</CardLabel>
          {patrimonioInvestido != null ? (
            <p className="font-display text-2xl font-semibold text-navy">
              {currencyFormatter.format(patrimonioInvestido)}
            </p>
          ) : (
            <p className="text-sm text-ink-60">não informado</p>
          )}
        </div>

        <div className="pointer-events-none relative z-[1] mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-sm font-semibold text-blue">Ver plano →</span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={`pointer-events-auto rounded-full px-3 py-1.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft ${focoVisivel}`}
          >
            Excluir
          </button>
        </div>
      </Card>

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-client-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4"
        >
          <div className="w-full max-w-sm rounded-card bg-white p-7 shadow-brand-lg">
            <h2
              id="delete-client-title"
              className="font-display text-xl font-semibold text-navy"
            >
              Excluir cliente
            </h2>
            <p className="mt-2 text-sm text-ink-60">
              Tem certeza que deseja excluir <strong className="text-navy">{nome}</strong>? Essa ação
              não pode ser desfeita e vai remover todos os dados associados a
              esse cliente.
            </p>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger"
              >
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                }}
                disabled={isPending}
                className={`rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-blue-soft disabled:cursor-not-allowed disabled:opacity-50 ${focoVisivel}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className={`rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${focoVisivel}`}
              >
                {isPending ? "Excluindo..." : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
