"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  AuthShell,
  authErrorClass,
  authInlineLinkClass,
  authPrimaryButtonClass,
  authSuccessClass,
} from "@/components/auth/auth-shell";
import { inputClass, labelClass } from "@/lib/wizard/field-styles";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Se a confirmação de e-mail estiver desativada no projeto, o Supabase
    // já retorna uma sessão ativa e podemos seguir direto pra área logada.
    if (data.session) {
      router.push("/carteira");
      router.refresh();
      return;
    }

    setMessage("Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.");
  }

  return (
    <AuthShell title="Criar conta" subtitle="Cadastre-se como assessor para montar a sua carteira.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="nome" className={labelClass}>
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            required
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
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
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass()}
          />
        </div>

        {error && (
          <p role="alert" className={authErrorClass}>
            {error}
          </p>
        )}
        {message && (
          <p role="status" className={authSuccessClass}>
            {message}
          </p>
        )}

        <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-60">
        Já tem conta?{" "}
        <Link href="/login" className={authInlineLinkClass}>
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
