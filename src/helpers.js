/**
 * Helpers for rendering in {@link WaferClient}
 *
 * @module HelpersClient
 */

import { updateTargets } from "./common.js";

const templateCache = new Map();

/**
 *
 * @param {string} html
 * @param {boolean} [firstChild]
 * @returns
 */
const stamp = (html, firstChild = false) => {
  const trimmed = html.trim();

  let cached = templateCache.get(trimmed);
  if (!cached) {
    const template = document.createElement("template");
    template.innerHTML = trimmed;

    templateCache.set(trimmed, template);
    cached = template;
  }

  if (firstChild) {
    return cached.content.firstChild.cloneNode(true);
  }

  return cached.content.cloneNode(true);
};

/**
 *
 * @param {Element} target
 * @param {string} name
 * @param {object} [detail]
 * @param {EventInit} [opts]
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
 *
 * @param {Object} opts
 * @param {Element} opts.container
 * @param {any[]} opts.items
 * @param {string} opts.html
 * @param {((value: any, index: number) => string)} opts.keyFn
 * @param {import("./types").Target[]} [opts.targets]
 * @param { ((el: Element, item?: any, index?: number) => void) | null} [opts.init]
 * @param { Object<string, import("./types").TargetEvents>} [opts.events]
 *
 */
const repeat = ({
  container,
  items,
  html,
  keyFn,
  targets = [],
  init = null,
  events = {},
}) => {
  /**
   * @type {Object<string, string>}
   */
  const indexToKey = {};
  /**
   * @type {Object<string, {index: number, el: Element | null}>}
   */
  const keyMap = {};

  for (const [index, item] of items.entries()) {
    const key = keyFn(item, index);
    indexToKey[index] = key;
    keyMap[key] = { index, el: null };
  }

  /**
   * @type {Object<string, Element>}
   */
  const existingEls = {};
  const toRemove = [];

  for (const el of container.querySelectorAll(":scope> *[wafer-key]")) {
    const key = el.getAttribute("wafer-key");
    if (key) {
      existingEls[key] = el;
      if (!keyMap[key]) {
        toRemove.push(el);
      } else {
        keyMap[key].el = el;
      }
    }
  }

  // remove
  for (const el of toRemove) {
    el.remove();
  }

  // update and move those with greatest distance to travel first
  /**
   * @type {import("./types").ElInfo[]}
   */
  const distanceToTravel = [];
  const childrenKeys = [...container.children].map((child) =>
    child.getAttribute("wafer-key")
  );

  let targetIndex = 0;

  for (const [index, item] of items.entries()) {
    const key = indexToKey[index];
    const currentIndex = childrenKeys.indexOf(key);

    if (existingEls[key]) {
      updateTargets(apply, existingEls[key], {
        value: item,
        targets,
      });

      if (targetIndex !== currentIndex) {
        const distance = currentIndex - targetIndex;
        distanceToTravel.push({
          el: existingEls[key],
          targetIndex,
          distance,
        });
      }

      targetIndex++;
    }
  }
  distanceToTravel.sort((a, b) => b.distance - a.distance);

  // move
  for (const item of distanceToTravel) {
    if (item.targetIndex !== [...container.children].indexOf(item.el)) {
      container.children[item.targetIndex].before(item.el);
    }
  }

  // add
  let nextIndex = 0;
  for (const [index, item] of items.entries()) {
    const key = indexToKey[index];

    if (!existingEls[key]) {
      const el = stamp(html, true);
      if (init) {
        init(el, item, index);
      }

      updateTargets(apply, el, {
        value: item,
        targets: targets.concat({
          selector: "self",
          use: () => key,
          attribute: "wafer-key",
        }),
      });

      let nextEl = null;
      if (index > nextIndex) {
        nextIndex = index;
      }

      do {
        nextEl =
          keyMap[indexToKey[nextIndex]] && keyMap[indexToKey[nextIndex]].el;
        if (!nextEl) {
          nextIndex++;
        }
      } while (nextEl === null && nextIndex < items.length);

      for (const selector of Object.keys(events)) {
        const eventNames = Object.keys(events[selector]);

        for (const name of eventNames) {
          const def = events[selector][name];

          bindEvent(el, selector, name, def);
        }
      }

      container.insertBefore(el, nextEl);
    }
  }
};

/**
 *
 * @param {Element} el
 * @param {string} selector
 * @param {(el: Element) => void} func
 */
const apply = (el, selector, func) => {
  if (selector === "self") {
    func(el);
  } else {
    const shadow = selector[0] === "$";
    const doc = selector[0] === "@";
    const target = shadow ? el.shadowRoot || el : doc ? document : el;
    const targetSelector = shadow || doc ? selector.substr(1) : selector;

    for (const el of target.querySelectorAll(targetSelector)) {
      func(el);
    }
  }
};

/**
 *
 * @param {Element} el
 * @param {string} selector
 * @param {string} name
 * @param {((ev: Event) => any) | import("./types").TargetEvent} def
 */
const bindEvent = (el, selector, name, def) => {
  /**
   * @type {(this: Element, ev: Event) => any}
   */
  let boundFn;
  /**
   * @type {boolean | AddEventListenerOptions | undefined}
   */
  let fnOpts = undefined;
  if (typeof def !== "function") {
    const { fn, target = el, opts = {} } = def;
    fnOpts = opts;
    boundFn = fn.bind(target);
  } else {
    boundFn = def.bind(el);
  }
  apply(el, selector, (eventEl) => {
    eventEl.addEventListener(name, boundFn, fnOpts);
  });
};

export { stamp, emit, repeat, apply, bindEvent };
