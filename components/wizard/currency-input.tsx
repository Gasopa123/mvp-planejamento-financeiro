"use client";

import type { ChangeEvent } from "react";
import { inputClass } from "@/lib/wizard/field-styles";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type CurrencyInputProps = {
  id?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  invalid?: boolean;
};

// Input de moeda brasileira que formata "à medida que digita" (mask),
// mas expõe pro estado do formulário o número puro em reais (ex: 1234.56).
// Sem lib externa — só manipulação de string dos dígitos. O texto exibido é
// derivado diretamente de `value`, então o componente fica 100% controlado
// pelo pai, sem estado interno pra sincronizar.
export function CurrencyInput({
  id,
  value,
  onChange,
  invalid,
}: CurrencyInputProps) {
  const display = value != null ? currencyFormatter.format(value) : "";

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, "");

    if (digitsOnly === "") {
      onChange(null);
      return;
    }

    onChange(Number(digitsOnly) / 100);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      placeholder="R$ 0,00"
      value={display}
      onChange={handleChange}
      className={inputClass(invalid)}
    />
  );
}
