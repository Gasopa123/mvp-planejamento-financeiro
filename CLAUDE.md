# MVP — Planejamento Financeiro Dinâmico para Assessores

## Contexto
App para assessores financeiros cadastrarem clientes e gerarem dashboards
dinâmicos de planejamento financeiro (gráficos, projeções de aposentadoria,
simulações interativas). Vai virar SaaS multi-tenant depois.

## Stack
Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres + Auth + RLS).
Deploy na Vercel. Gráficos em SVG customizado (sem lib de chart no MVP).

## Requisitos funcionais
1. Autenticação: cadastro e login de advisor (Supabase Auth).
2. Carteira de clientes: listar, adicionar, excluir clientes do advisor logado.
3. Cadastro de cliente, em grupos:
   - Dados pessoais: nome, idade, estado civil
   - Cônjuge (se aplicável): nome, data de nascimento, dependente (sim/não)
   - Filhos (lista, 0 a N): nome, data de nascimento, dependente (sim/não)
   - Estilo de vida: esporte favorito, hobbies
   - Financeiro: renda mensal, despesa mensal, patrimônio investido
   - Imóveis (lista, 0 a N): valor, financiado (sim/não), adquirido após o casamento (sim/não)
   - Automóveis (lista, 0 a N): valor, financiado (sim/não), adquirido após o casamento (sim/não)
   - Objetivos: curto, médio e longo prazo (texto/lista)
   - Participação societária: sim/não, valor aproximado
   - Aposentadoria: idade que pretende se aposentar, expectativa de vida, pretensão salarial pós-aposentadoria
   - Planos futuros: pretende adquirir outros imóveis/automóveis (sim/não), é CLT (sim/não), tem seguro de vida (sim/não)
4. Dashboard dinâmico do cliente com abas: Perfil, Diagnóstico financeiro,
   Patrimônio, Objetivos, Aposentadoria, Simulações (sliders interativos),
   Carteira recomendada, Plano de ação.

## Modelo de dados (Postgres/Supabase)
Tabelas: advisors, clients (FK advisor_id), spouses (FK client_id, 1:1),
children (FK client_id, 1:N), properties (FK client_id, 1:N, tipo imovel/automovel),
goals (FK client_id, 1:N, prazo curto/medio/longo), assumptions
(inflacao_projetada, cdi_atual, rentabilidade_real_padrao — editáveis, não hardcoded).
Row Level Security: advisor só acessa linhas onde advisor_id = auth.uid().

## Motor de cálculo financeiro
- capacidade_investimento = renda_mensal - despesa_mensal
- taxa_poupanca = capacidade_investimento / renda_mensal
- reserva_emergencia_ideal = despesa_mensal × 6
- Acumulação até aposentadoria (valor futuro de anuidade + patrimônio atual capitalizado):
  i_mensal = (1 + taxa_anual)^(1/12) - 1
  FV_aportes = aporte_mensal × [((1+i_mensal)^n - 1) / i_mensal] × (1+i_mensal)
  FV_patrimonio_atual = patrimonio_atual × (1 + taxa_anual)^anos
- Projeção de meta com inflação: valor_futuro = valor_hoje × (1 + inflacao)^anos
- Aporte necessário: aporte = (meta_futura - patrimonio_atual×(1+i)^n) × i / [(1+i)^n - 1]
- Simulação de sustentabilidade (drawdown), ano a ano da aposentadoria até a
  expectativa de vida: saldo = (saldo - saque_anual) × (1 + taxa_anual);
  se saldo <= 0, patrimônio se esgota nesse ano.
- Conversão em indicadores de mercado:
  taxa_nominal_prefixada = (1 + rentabilidade_real) × (1 + inflacao_projetada) - 1
  percentual_do_cdi = taxa_nominal_prefixada / cdi_atual

Não commitar segredos (chaves do Supabase) — usar variáveis de ambiente.
