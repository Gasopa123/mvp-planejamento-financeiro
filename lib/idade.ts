// Calcula a idade em anos completos a partir de uma data de nascimento
// (string ISO "AAAA-MM-DD", como vem do Supabase/inputs type="date").
// Lemos ano/mes/dia do texto: new Date("AAAA-MM-DD") seria interpretado como
// UTC e deslocaria o dia em fusos negativos (ex.: America/Sao_Paulo).
export function calcularIdade(dataNascimentoISO: string, hoje = new Date()): number {
  const [ano, mes, dia] = dataNascimentoISO.split("-").map(Number);
  let idade = hoje.getFullYear() - ano;
  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes ||
    (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}
