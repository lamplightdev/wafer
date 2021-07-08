/**
 * Common functionality shared between {@link WaferClient} and {@link WaferServer}
 *
 * @module Common
 */

/**
 *
 * @param {function} apply
 * @param {Element|import("./server/element").ServerElement} el
 * @param {Object} opts
 * @param {any} opts.value
 * @param {import("./types").Target[]} opts.targets
 *
 */
const updateTargets = async (apply, el, { value, targets }) => {
  for (const target of targets) {
    const { selector, attribute, text, dom, property, use } = target;

    const selectorVal =
      typeof selector === "function" ? selector(value) : selector;

    await apply(
      el,
      selectorVal,
      /**
       *
       * @param {Element} targetEl
       */
      async (targetEl) => {
        const useValue = use ? use(value, el, targetEl) : value;

        if (attribute) {
          if ([null, false, undefined].includes(useValue)) {
            targetEl.removeAttribute(attribute);
          } else {
            targetEl.setAttribute(attribute, useValue === true ? "" : useValue);
          }
        }

        if (property && useValue !== undefined) {
          // @ts-ignore: allow to set any prop
          targetEl[property] = useValue;
        }

        if (text) {
          targetEl.textContent = useValue;
        }

        if (dom) {
          await dom(targetEl, useValue, el);
        }
      }
    );
  }
};

export { updateTargets };
