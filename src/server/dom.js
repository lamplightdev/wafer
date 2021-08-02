/**
 * Helpers for rendering in {@link WaferServer}
 *
 * @module DOMServer
 */

import { ServerElement, parse } from "./element.js";
import { updateTargets } from "../common.js";

/**
 * Utility to render a series of items as Elements into a container
 *
 * @param {Object} opts - Repeat options
 * @param {ServerElement} opts.container - Container into which to render repeated items
 * @param {any[]} opts.items - Array of items which are used to create/update elements
 * @param {string} opts.html - HTML template which will be used to create elements
 * @param {((value: any, index: number) => string)} opts.keyFn - Key function which is used to create unique id for each item/element
 * @param {import("../types").Target[]} [opts.targets] - How to update an element when an item changes
 * @param { ((el: ServerElement, item?: any, index?: number) => void) | null} [opts.init] - function to apply when an element is first created
 * @param {import("../types").Registry} [opts.registry] - Object of tag names to Wafer component definitions
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
  /**
   * Empty the container
   */
  container.innerHTML = "";

  for (const [index, item] of items.entries()) {
    const key = "" + keyFn(item, index);

    /**
     * Create a {@link ServerElement} for each item by rendering from the
     * template and extracting the first {@link ServerElement} instance
     */
    const el = /** @type {ServerElement[]} */ (
      (await parse(html.trim(), registry)).childNodes
    ).filter((node) => node instanceof ServerElement)[0];

    /**
     * Run the initialisation function if passed
     */
    if (init) {
      init(el, item, index);
    }

    /**
     * Update the element with desired target updates, and add the wafer-key
     * attribute for use later. The result is `await`ed so that asynchronous
     * updates can complete before response is sent
     */
    await updateTargets(apply, el, {
      value: item,
      targets: targets.concat({
        selector: "self",
        use: () => key,
        attribute: "wafer-key",
      }),
    });

    /**
     * Add element into container
     */
    container.appendChild(el);
  }
};

/**
 * Take a target DOM element and a selector to apply to that element
 * and run a function on every match. A promise is returned so that
 * the result can be `await`ed - important in the server context
 * where we want all asynchronous updates can complete before the
 * response is sent
 *
 * @param {Element|import("./wafer").default} el
 * @param {string} selector
 * @param {(el: Element|import("./element").ServerElement) => void} func
 *
 * @returns {Promise<void[]>}
 */
const apply = (el, selector, func) => {
  /**
   * An array containing the results of each update
   */
  const promises = [];

  if (selector === "self") {
    /**
     * Special case - 'self' applies function to DOM element itself
     */
    promises.push(func(el));
  } else {
    /**
     * Special case - the selector should be applied to the
     * DOM node's shadow root
     */
    const shadow = selector[0] === "$";

    /**
     * Special case - the selector should be applied to the parent 'document'
     * 'document' in a server context is  defined as the root element, whatever
     * element that is - i.e. no necessarily the document, which is the case
     * for the client implementation
     */
    const doc = selector[0] === "@";

    /**
     * The element on which the selector will be run
     */
    let target;

    if (doc) {
      /**
       * If we are applying the selector to the 'document', then ascent the
       * hierarchy until we reach the top
       */
      target = el;
      while (target.parentNode) {
        target = target.parentNode;
      }
    } else {
      /**
       * Use the shadow root as the target in the special case
       */
      target = shadow ? el.shadowRoot : el;
    }

    if (target) {
      /**
       * Remove any leading character used for the special cases above
       */
      const targetSelector = shadow || doc ? selector.substr(1) : selector;

      /**
       * Apply function to all matches, store in results array
       */
      for (const el of target.querySelectorAll(targetSelector)) {
        promises.push(func(el));
      }
    }
  }

  /**
   * Return a promise that will resolve when all updates have resolved
   */
  return Promise.all(promises);
};

export { repeat, apply };
