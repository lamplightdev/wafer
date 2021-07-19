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
        name: "Wafer",
      },
    ],
    plugins: [terser()],
  },
  {
    input: "src/dom.js",
    output: [
      {
        file: "dist/dom.js",
        format: "es",
        sourcemap: true,
      },
      {
        file: "dist/dom.browser.js",
        format: "iife",
        name: "WaferDOM",
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

  // CJS for node environments using CJS
  {
    input: "src/wafer.js",
    output: {
      file: "lib/wafer.cjs",
      format: "cjs",
      exports: "default",
    },
  },
  {
    input: "src/dom.js",
    output: {
      file: "lib/dom.cjs",
      format: "cjs",
    },
  },
  {
    input: "src/server/wafer.js",
    output: {
      file: "lib/server/wafer.cjs",
      format: "cjs",
      exports: "default",
    },
    external: ["node-html-parser", "module"],
  },
  {
    input: "src/server/dom.js",
    output: {
      file: "lib/server/dom.cjs",
      format: "cjs",
    },
    external: ["node-html-parser", "module"],
  },
  {
    input: "src/server/element.js",
    output: {
      file: "lib/server/element.cjs",
      format: "cjs",
    },
    external: ["node-html-parser", "module"],
  },
];
