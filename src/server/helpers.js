import { HTMLServerElement, render } from "./element.js";
import { updateTargets } from "../common.js";

/**
 * @typedef { import("./wafer").WaferServer } WaferServer
 * @typedef { import("node-html-parser").Node } ParserNode
 * @typedef { import("node-html-parser").HTMLElement } ParserHTMLElement
 * @typedef { import("../wafer-mixin").Target } Target
 */

/**
 * @typedef ElOpts
 * @prop {'open' | 'closed' | false} [shadow]
 * @prop {string | ParserNode | ParserNode[] | null} [shadowContents]
 * @prop {ParserHTMLElement[]} [contents]
 * @prop {Object<string, any>} [attrs]
 * @prop {Target[]} [targets]
 */

/**
 * @typedef CustomElOpts
 * @prop {ParserHTMLElement[]} [contents]
 * @prop {Object<string, any>} [attrs]
 * @prop {Object<string, any>} [props]
 */

/**
 *
 * @param {Object} opts
 * @param {ParserHTMLElement} opts.container
 * @param {any[]} opts.items
 * @param {string} opts.html
 * @param {((value: any, index: number) => string)} opts.keyFn
 * @param {Target[]} [opts.targets]
 * @param { ((el: HTMLServerElement, item?: any, index?: number) => void) | null} [opts.init]
 * @param {Object<string, {serverOnly?: boolean, def: new (...args: any[]) => WaferServer}>} [opts.registry]
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

    const el = /** @type {[HTMLServerElement]} */ (
      (await render(html, registry)).childNodes
    ).filter((node) => node instanceof HTMLServerElement)[0];

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
 * @param {Element|WaferServer} el
 * @param {string} selector
 * @param {(el: Element|WaferServer) => void} func
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
