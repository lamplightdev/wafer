import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/wafer.js",
    output: [
      {
        file: "dist/wafer.js",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/wafer.browser.js",
        format: "iife",
        name: "window",
        extend: true,
      },
    ],
    plugins: [terser()],
  },
  {
    input: "src/helpers.js",
    output: [
      {
        file: "dist/helpers.js",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/helpers.browser.js",
        format: "iife",
        name: "WaferHelpers",
      },
    ],
    plugins: [terser()],
  },
  {
    input: "src/knobs.js",
    output: [
      {
        file: "dist/knobs.js",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/knobs.browser.js",
        format: "iife",
      },
    ],
    plugins: [terser()],
  },
];
