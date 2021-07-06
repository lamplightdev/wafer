<p align="center">
<img src="./images/logo.svg" alt="" width="160">
</p>

# Wafer

[![Tests](https://github.com/lamplightdev/wafer/actions/workflows/node.js.yml/badge.svg)](https://github.com/lamplightdev/wafer/actions/workflows/node.js.yml)
[![npm](https://img.shields.io/npm/v/@lamplightdev/wafer)](https://www.npmjs.com/package/@lamplightdev/wafer)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@lamplightdev/wafer)](https://bundlephobia.com/package/@lamplightdev/wafer)

Welcome to Wafer: a simple and lightweight base library for building Web Components that can be used on the browser, server or both.

Wafer is:

- **Small** 🪶<br/>
  <2kb (minified and compressed)

- **Fast** ⚡️<br/>
  Template updates are declared using CSS selectors leveraging native browser performance

- **Efficient** 🔋<br/>
  Updates are batched preventing any unnecessary renders

- **Flexible** 💪🏾 <br/>
  Import directly, drop in a `<script>` tag, or use your favourite bundler

- **Server ready** ▶️<br/>
  Wafer components can be used unchanged in browsers and on the server

## Documentation

Please visit the [documentation site](https://waferlib.netlify.app/). To get started checkout how to [install Wafer](https://waferlib.netlify.app/docs/010-overview/020-installation/), read through a [quick guide](https://waferlib.netlify.app/docs/010-overview/030-quick/) outlining the basic concepts, or dive in to a [live example](https://waferlib.netlify.app/docs/010-overview/040-example/).

## Installation

The Wafer package contains both the client and server libraries. To install for use with build tools and/or server usage, use your favourite package manager:

```
npm install --save @lamplightdev/wafer
```

You can then import the required base class:

```js
import Wafer from "@lamplightdev/wafer";

class MyExample extends Wafer {}

customElements.define("my-example", MyExample);
```

or import directly from a CDN to use without a package manager or bundler:

```js
import Wafer from "https://unpkg.com/@lamplightdev/wafer";
```

Alternatively if you are feeling retro use a `<script>` tag:

```html
<script src="https://unpkg.com/@lamplightdev/wafer/dist/wafer.browser.js"></script>
<script>
  class MyExample extends Wafer {}

  customElements.define("my-example", MyExample);
</script>
```

On the server Wafer is available as both an ES and a CJS module:

```js
// ES module
import WaferServer from "@lamplightdev/wafer/server/wafer.js";
// or CJS
const WaferServer = require("@lamplightdev/wafer/server/wafer");

class MyExample extends WaferServer {}
```

## Building

The source files are located in the `/src` folder, and can be built with:

```
npm run build
```

This will lint the code, create Typescript types from JSDoc comments, run tests and finally build the package files. To run these steps individually please see the `scripts` entries in `package.json`.

## Contributing

All contributions are welcome - please file an issue or submit a PR.

## License

The code is released under the [MIT license](./LICENSE.md).

## Credits

Wafer was created by [Chris](https://lamplightdev.com/) ([@lamplightdev](https://twitter.com/lamplightdev)) - say hi!
