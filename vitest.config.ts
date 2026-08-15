import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "packages/**/*.{test,spec}.{ts,tsx,js,mjs}",
      "apps/**/*.{test,spec}.{ts,tsx,js,mjs}"
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/TDHA/**",
      "**/.next/**"
    ]
  }
});
