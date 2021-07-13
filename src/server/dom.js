/**
 * Helpers for rendering in {@link WaferServer}
 *
 * @module DOMServer
 */

import { ServerElement, render } from "./element.js";
import { updateTargets } from "../common.js";

/**
 *
 * @param {Object} opts
 * @param {import("node-html-parser").HTMLElement} opts.container
 * @param {any[]} opts.items
 * @param {string} opts.html
 * @param {((value: any, index: number) => string)} opts.keyFn
 * @param {import("../types").Target[]} [opts.targets]
 * @param { ((el: ServerElement, item?: any, index?: number) => void) | null} [opts.init]
 * @param {import("../types").Registry} [opts.registry]
 * @returns
 */
const repeat = async ({
  container,
  items,
  html,
  keyFn,
  targets = [],
  init = null,
  registry = {},
}) => {
  container.innerHTML = "";

  for (const [index, item] of items.entries()) {
    const key = keyFn(item, index);

    const el = /** @type {[ServerElement]} */ (
      (await render(html, registry)).childNodes
    ).filter((node) => node instanceof ServerElement)[0];

    if (init) {
      init(el, item, index);
    }

    await updateTargets(apply, el, {
      value: item,
      targets: targets.concat({
        selector: "self",
        use: () => key,
        attribute: "wafer-key",
      }),
    });

    container.appendChild(el._element);
  }
};

/**
 *
 * @param {Element|import("./wafer").WaferServer} el
 * @param {string} selector
 * @param {(el: Element|import("./wafer").WaferServer) => void} func
 */
const apply = (el, selector, func) => {
  const promises = [];

  if (selector === "self") {
    promises.push(func(el));
  } else {
    let target;

    const shadow = selector[0] === "$";
    const doc = selector[0] === "@";

    if (doc) {
      target = el;
      while (target.parentNode) {
        target = target.parentNode;
      }
    } else {
      target = shadow ? el.shadowRoot : el;
    }

    if (target) {
      const targetSelector = shadow || doc ? selector.substr(1) : selector;

      for (const el of target.querySelectorAll(targetSelector)) {
        promises.push(func(el));
      }
    }
  }

  return Promise.all(promises);
};

export { repeat, apply };
