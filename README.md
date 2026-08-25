# MVP Planejamento Financeiro

App Next.js para assessores montarem carteira de clientes, diagnóstico financeiro, objetivos, simulações de aposentadoria e modo apresentação.

## Requisitos

- Node.js 22.20+
- npm
- Projeto Supabase configurado

## Configuração local

Copie o arquivo de exemplo e preencha as variáveis públicas do Supabase:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Sem essas variáveis, a rota inicial pode retornar erro porque o app cria o client Supabase no servidor.

## Rodar em desenvolvimento

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Scripts úteis

```bash
npm test
npm run lint
npm run build
npm audit --audit-level=high
```

## Funcionalidades principais

- Cadastro, login e redefinição de senha via Supabase.
- Carteira de clientes isolada por advisor.
- Wizard de criação de cliente.
- Dashboard com perfil, diagnóstico, patrimônio, aposentadoria, objetivos, simulações e plano de ação.
- Modo apresentação para reunião com cliente.
- Endpoint `/api/indicadores` para CDI/IPCA do BCB com cache.

## Deploy

O projeto roda na Vercel. Configure no painel as mesmas variáveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
