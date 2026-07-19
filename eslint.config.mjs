import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Strict formatting rules for maximum organization
      semi: ["error", "always"],
      quotes: ["error", "single"],
      // Warn if you use 'any' type, keeping TypeScript strict
      "@typescript-eslint/no-explicit-any": "warn",
      // Prevent unused variables from cluttering the code
      "@typescript-eslint/no-unused-vars": "error",
    },
  },
);
