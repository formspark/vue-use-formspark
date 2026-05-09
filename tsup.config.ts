import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  external: ["vue"],
  format: ["esm", "cjs"],
  outDir: "dist",
  sourcemap: true,
  splitting: false,
});
