// Calcula a idade em anos completos a partir de uma data de nascimento
// (string ISO "AAAA-MM-DD", como vem do Supabase/inputs type="date").
export function calcularIdade(dataNascimentoISO: string, hoje = new Date()): number {
  const nascimento = new Date(dataNascimentoISO);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}
