/**
 * Helpers for rendering in {@link WaferClient}
 *
 * @module DOMClient
 */

import { updateTargets } from "./common.js";

/**
 * Keep a cache of created templates
 */
const templateCache = new Map();

/**
 * Stamp out an element from a string template
 *
 * @param {string} html - The string template
 * @param {boolean} [firstChild] - if `true` use the `firstChild` of created element, used when a single element is required rather than a DocumentFragment
 *
 * @returns {DocumentFragment | Element} - The stamped out element
 */
const stamp = (html, firstChild = false) => {
  /**
   * Keep things tidy
   */
  const trimmed = html.trim();

  /**
   * Retrieve from cache if possible
   */
  let cached = templateCache.get(trimmed);
  if (!cached) {
    /**
     * Create and populate a template element
     */
    const template = document.createElement("template");
    template.innerHTML = trimmed;

    /**
     * Update cache
     */
    templateCache.set(trimmed, template);
    cached = template;
  }

  /**
   * Clone away!
   */

  if (firstChild) {
    return cached.content.firstElementChild.cloneNode(true);
  }

  return cached.content.cloneNode(true);
};

/**
 *  Helper function for emitting DOM events
 *
 * @param {Element} target - the element from which the event should be dispatched
 * @param {string} name - the event name
 * @param {object} [detail] - the detail object to pass with event
 * @param {EventInit} [opts] - event options
 */
const emit = (
  target,
  name,
  detail = {},
  opts = {
    bubbles: true,
    composed: true,
  }
) => {
  target.dispatchEvent(
    new CustomEvent(name, {
      ...opts,
      detail,
    })
  );
};

/**
 * Utility to efficiently repeat and update a series of Elements into a
 * container, taking in an html template from which the element will be stamped
 * out, and a series of items and targets used to create and/or update
 * elements
 *
 * @param {Object} opts - Repeat options
 * @param {Element} opts.container - Container into which to render repeated items
 * @param {any[]} opts.items - Array of items which are used to create/update elements
 * @param {string} opts.html - HTML template which will be used to create elements
 * @param {((value: any, index: number) => string)} opts.keyFn - Key function which is used to create unique id for each item/element
 * @param {import("./types").Target[]} [opts.targets] - How to update an element when an item changes
 * @param { ((el: Element, item?: any, index?: number) => void) | null} [opts.init] - function to apply when an element is first created
 * @param { Object.<string, import("./types").TargetEvents>} [opts.events] - list of events to bind to element when created
 *
 */
const repeat = async ({
  container,
  items,
  html,
  keyFn,
  targets = [],
  init = null,
  events = {},
}) => {
  /**
   * A record of an item's index (position) in the array to its key
   *
   * @type {Object.<string, string>}
   */

  const indexToKey = {};

  /**
   * A record of an item's key to it's index (position) and existing element
   *
   * @type {Object.<string, {index: number, el: Element | null}>}
   */
  const keyMap = {};

  /**
   * Update records
   */
  for (const [index, item] of items.entries()) {
    /**
     * ensure key is a string so we can compare with key when set as an
     * attribute (that will always be a string)
     */
    const key = "" + keyFn(item, index);
    indexToKey[index] = key;
    keyMap[key] = { index, el: null };
  }

  /**
   * A record of key to existing elements
   *
   * @type {Object.<string, Element>}
   */
  const existingEls = {};

  /**
   * A record of existing elements to remove (i.e. they are not related by
   * key to any current item)
   */
  const toRemove = [];

  /**
   * All the keys of existing elements in DOM order
   */
  const childrenKeys = [];

  for (const el of container.children) {
    const key = el.getAttribute("wafer-key");
    if (key) {
      childrenKeys.push(key);

      /**
       * For each element in the container that has a key, keep a record of
       * this element
       */
      existingEls[key] = el;

      if (!keyMap[key]) {
        /**
         * If there's no match with the keys of the current items the element
         * should be removed
         */
        toRemove.push(el);
      } else {
        /**
         * If there is a match then reference the element in the keyMap so
         * it can be used for updates below
         */
        keyMap[key].el = el;
      }
    }
  }

  /**
   * Remove any unmatched elements
   */
  for (const el of toRemove) {
    el.remove();
  }

  /**
   * Update and move existing elements, moving those with the greatest distance
   * to travel first.
   */

  /**
   * For existing elements that need to be moved keep a track of where
   * they need to move to and how far they have travel
   *
   * @typedef ElInfo
   * @prop {Element} el - The existing element reference
   * @prop {number} targetIndex - The index the element should be moved to
   * @prop {number} distance - The distance the element needs to move
   *
   * @type {ElInfo[]}
   */
  const elementsToMove = [];

  /**
   * A counter indicating the new index position
   */
  let targetIndex = 0;

  for (const [index, item] of items.entries()) {
    const key = indexToKey[index];
    const currentIndex = childrenKeys.indexOf(key);

    if (existingEls[key]) {
      /**
       * Apply updates to existing elements
       */
      await updateTargets(apply, existingEls[key], {
        value: item,
        targets,
      });

      /**
       * Attach event listeners since the existing elements may have been
       * rendered on the server but won't have event listeners attached yet.
       * Adding the same bound listener multiple times is a no-op
       * TODO: think of a way to only do this if necessary
       */
      for (const selector of Object.keys(events)) {
        const eventNames = Object.keys(events[selector]);

        for (const name of eventNames) {
          const def = events[selector][name];

          bindEvent(existingEls[key], selector, name, def);
        }
      }

      if (targetIndex !== currentIndex) {
        /**
         * If the element has a new position, calculate the distance it has to
         * travel
         */
        const distance = Math.abs(currentIndex - targetIndex);

        /**
         * Update the records
         */
        elementsToMove.push({
          el: existingEls[key],
          targetIndex,
          distance,
        });
      }

      /**
       * Increment the new index
       */
      targetIndex++;
    }
  }

  /**
   * Sort by distance so we move the elements that have the greatest distance
   * to travel first
   */
  elementsToMove.sort((a, b) => b.distance - a.distance);

  /**
   * Move the elements
   */
  for (const item of elementsToMove) {
    if (item.targetIndex !== [...container.children].indexOf(item.el)) {
      /**
       * Move the element if it's not already in the correct place
       */
      container.children[item.targetIndex].after(item.el);
    }
  }

  /**
   * Add any new elements into their correct position inside the container
   */

  /**
   * Reverse items as we want to use `insertBefore` and will need the
   * (n+1)th element to exist before we can insert the (n)th element
   */
  const reversedItems = items.slice().reverse();

  for (const [reversedIndex, item] of reversedItems.entries()) {
    /**
     * Original index
     */
    const index = items.length - 1 - reversedIndex;

    const key = indexToKey[index];

    if (!existingEls[key]) {
      /**
       * If the element doesn't already exist, create it
       */
      const el = /** @type{Element} **/ (stamp(html, true));

      /**
       * Run the initialisation function if passed
       */
      if (init) {
        init(el, item, index);
      }

      /**
       * Update the element with desired target updates, and add the wafer-key
       * attribute for use later
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
       * Bind events to new element
       */
      for (const selector of Object.keys(events)) {
        const eventNames = Object.keys(events[selector]);

        for (const name of eventNames) {
          const def = events[selector][name];
          bindEvent(el, selector, name, def);
        }
      }

      /**
       * Get a reference to the element after the one to be inserted.
       * If there isn't one then the element will be inserted at the end
       */
      const afterIndex = index + 1;
      const elAfter =
        keyMap[indexToKey[afterIndex]] && keyMap[indexToKey[afterIndex]].el;
      container.insertBefore(el, elAfter || null);

      /**
       * Update the keyMap with the new element reference so it's available
       * for the next element that's going to be inserted
       */
      keyMap[indexToKey[index]].el = el;
    }
  }
};

/**
 * Take a target DOM element and a selector to apply to that element
 * and run a function on every match
 *
 * @param {Element} el - target DOM element
 * @param {string} selector - CSS3 selector
 * @param {(el: Element) => void} func - function to run on all matches
 */
const apply = async (el, selector, func) => {
  if (selector === "self") {
    /**
     * Special case - 'self' applies function to DOM element itself
     */
    await func(el);
  } else {
    /**
     * Special case - the selector should be applied to the
     * DOM node's shadow root
     */
    const shadow = selector[0] === "$";

    /**
     * Special case - the selector should be applied to the parent document
     */
    const doc = selector[0] === "@";

    /**
     * Use the correct target
     */
    const target = shadow ? el.shadowRoot || el : doc ? document : el;

    /**
     * Remove any leading character used for the special cases above
     */
    const targetSelector = shadow || doc ? selector.substr(1) : selector;

    /**
     * Apply function to all matches
     */
    for (const el of target.querySelectorAll(targetSelector)) {
      await func(el);
    }
  }
};

/**
 * Bind an event listener to a series of CSS selector matches in a DOM node
 *
 * @param {Element} el - the element then listener should be attached to (unless overidden by specifying a different target in `def`)
 * @param {string} selector - the selector whose matches in `el` this event listener should be added
 * @param {string} name - the name of the event whose listener is being added
 * @param {((ev: Event) => any) | import("./types").TargetEvent} func - the listener being added, or a `TargetEvent`
 */
const bindEvent = (el, selector, name, func) => {
  /**
   * The bound function to add as a listener
   * @type {(this: Element, ev: Event) => any}
   */
  let boundFn;

  /**
   * The event listener options to use
   * @type {boolean | AddEventListenerOptions | undefined}
   */
  let fnOpts = undefined;

  if (typeof func !== "function") {
    /**
     * `func` is an `TargetEvent`, so pull out the details
     */
    const { fn, target = el, opts = {} } = func;
    fnOpts = opts;

    /**
     * Bind `TargetEvent` function to target
     */
    boundFn = fn.bind(target);
  } else {
    /**
     * `func` is a function so bind to `el`
     */
    boundFn = func.bind(el);
  }

  /**
   * Attach event listener to all matches of `selector` in `el`
   */
  apply(el, selector, (eventEl) => {
    eventEl.addEventListener(name, boundFn, fnOpts);
  });
};

export { stamp, emit, repeat, apply, bindEvent };
