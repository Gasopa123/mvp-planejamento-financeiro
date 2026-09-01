import Link from "next/link";

export default function CadastroPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-2xl font-semibold text-gray-900">Cadastro restrito</h1>
        <p className="text-sm text-gray-600">
          O acesso de novos assessores é liberado manualmente. Peça um convite ao
          administrador para criar sua conta.
        </p>

        <Link
          href="/login"
          className="mt-6 block rounded-md bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
        >
          Voltar para o login
        </Link>
      </div>
    </main>
  );
}
