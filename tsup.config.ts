import { defineConfig } from "tsup";

export default defineConfig({
  // tsup's dts worker injects baseUrl, which TypeScript 6 rejects without this escape hatch.
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  entry: ["src/index.ts"],
  external: ["vue"],
  format: ["esm", "cjs"],
  outDir: "dist",
  sourcemap: true,
  splitting: false,
});
