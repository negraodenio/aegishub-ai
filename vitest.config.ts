import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@mindops/ai-core": path.resolve(__dirname, "./packages/ai-core/src/index.ts"),
      "@mindops/database": path.resolve(__dirname, "./packages/database/src/index.ts"),
      "@mindops/domain": path.resolve(__dirname, "./packages/domain/src/index.ts")
    }
  },
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
