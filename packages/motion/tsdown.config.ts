import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  platform: "neutral",
  external: ["react", "react-router", "gsap", "@gsap/react"],
  exports: true,
});
