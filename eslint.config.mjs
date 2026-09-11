import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import quality from "./eslint-rules/index.cjs";

// Código de produto. Este repo não tem src/: as raízes reais são app/,
// components/, lib/ e o proxy de rota na raiz.
const SOURCE_FILES = [
  "app/**/*.{ts,tsx}",
  "components/**/*.{ts,tsx}",
  "lib/**/*.{ts,tsx}",
  "proxy.ts",
];

// Baseline medido em 10/09/2026, com o teto de 350 linhas recém-ligado.
// São arquivos que já nasceram grandes; a regra existe para impedir novos,
// não para exigir refatoração agora. Ao mexer de verdade em um deles,
// quebre o arquivo e remova a linha daqui.
const ARQUIVOS_ACIMA_DO_TETO = [
  "lib/calculos.ts", // 761 linhas
  "components/wizard/client-wizard.tsx", // 496 linhas
  "components/wizard/steps/step-pessoal.tsx", // 478 linhas
  "components/wizard/steps/step-financeiro.tsx", // 457 linhas
  "lib/wizard/schema.ts", // 402 linhas
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: SOURCE_FILES,
    plugins: { quality },
    rules: {
      // Teto de tamanho por arquivo. Arquivo de teste fica fora do orçamento
      // por padrão da própria regra: o tamanho dele fala de cobertura, não de
      // fatoração.
      "quality/max-lines": [
        "warn",
        { max: 350, ignore: ARQUIVOS_ACIMA_DO_TETO },
      ],
      // console.* em server component ou server action vai parar no log da
      // Vercel. Aqui isso significaria patrimônio, renda e composição
      // familiar de cliente real em texto puro, contra .agent-skills/security.md.
      "quality/no-direct-console": [
        "error",
        { logger: "um adaptador de log dedicado" },
      ],
      // TODO: avaliar quality/no-direct-data-access restrito a components/**.
      // Fora agora porque no App Router server component e server action
      // acessam o Supabase direto, e a regra marcaria o padrão do framework
      // como erro em dez arquivos de app/.
    },
  },
  {
    // As regras vêm em CommonJS e são copiadas sem edição do template.
    files: ["eslint-rules/**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "readonly", require: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
