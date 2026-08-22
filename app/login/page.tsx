"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "recover">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("reset") === "success"
      ? "Senha redefinida com sucesso. Faça login com a nova senha."
      : null;
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/carteira");
    router.refresh();
  }

  async function handleRecoverSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    sessionStorage.setItem("passwordRecoveryEmail", email);
    router.push(`/redefinir-senha?email=${encodeURIComponent(email)}`);
  }

  function switchToRecover() {
    setError(null);
    setMessage(null);
    setMode("recover");
  }

  function switchToLogin() {
    setError(null);
    setMessage(null);
    setMode("login");
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">
          {mode === "login" ? "Entrar" : "Recuperar senha"}
        </h1>

        {mode === "login" ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={switchToRecover}
                className="font-medium text-gray-900 underline"
              >
                Esqueci minha senha
              </button>
            </p>

            <p className="mt-4 text-center text-sm text-gray-600">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-medium text-gray-900 underline">
                Cadastre-se
              </Link>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="recover-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  E-mail
                </label>
                <input
                  id="recover-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar código de recuperação"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={switchToLogin}
                className="font-medium text-gray-900 underline"
              >
                Voltar para o login
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
