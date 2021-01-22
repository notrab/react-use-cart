import external from "rollup-plugin-peer-deps-external";
import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";
import commonjs from "rollup-plugin-commonjs";

import pkg from "./package.json";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
  ],
  plugins: [
    external(),
    resolve(),
    babel({
      exclude: "node_modules/**",
    }),
    typescript({ objectHashIgnoreUnknownHack: true }),
    commonjs(),
  ],
};
