"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteClient(clientId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  // Filtra explicitamente por advisor_id além da RLS — defesa em profundidade.
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId)
    .eq("advisor_id", user.id);

  if (error) {
    return { error: "Não foi possível excluir o cliente. Tente novamente." };
  }

  revalidatePath("/carteira");
  return { error: null };
}
