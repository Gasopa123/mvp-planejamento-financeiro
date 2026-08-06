"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteClient } from "@/app/carteira/actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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
      <div className="relative flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <Link
          href={`/carteira/${id}`}
          className="absolute inset-0 z-0"
          aria-label={`Ver dashboard de ${nome}`}
        />

        <div className="pointer-events-none relative z-[1]">
          <p className="font-medium text-gray-900">{nome}</p>
          <p className="mt-1 text-sm text-gray-600">
            {idade != null ? `${idade} anos` : "Idade não informada"} ·
            Patrimônio investido:{" "}
            {patrimonioInvestido != null
              ? currencyFormatter.format(patrimonioInvestido)
              : "não informado"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="relative z-[1] rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Excluir
        </button>
      </div>

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-client-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2
              id="delete-client-title"
              className="text-lg font-semibold text-gray-900"
            >
              Excluir cliente
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir <strong>{nome}</strong>? Essa ação
              não pode ser desfeita e vai remover todos os dados associados a
              esse cliente.
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setError(null);
                }}
                disabled={isPending}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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
