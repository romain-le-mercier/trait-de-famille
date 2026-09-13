import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      // Les gardes du pilotage sont des scripts Node CommonJS, hors application :
      // la configuration Next/TypeScript ne leur convient pas et les refuse.
      ".claude/**",
      "trait_de_famille_prototype.html",
    ],
  },
];

export default config;
