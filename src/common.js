/**
 * Common functionality shared between {@link WaferClient} and {@link WaferServer}
 *
 * @module Common
 */

/**
 * Updated the the targets of a component
 *
 * @param {function} apply - function that will query DOM and apply changes to matches
 * @param {Element|import("./server/element").ServerElement} el - the DOM root to query
 * @param {Object} opts - options for how to update the targets
 * @param {any} opts.value - the value to use in updates
 * @param {import("./types").Target[]} [opts.targets] - array of selectors and which updates that should be applied
 *
 * @returns {Promise<void>} Return a promise so the updates can be `await`ed in server context
 *
 */
const updateTargets = async (apply, el, { value, targets = [] }) => {
  for (const target of targets) {
    const { selector, attribute, text, dom, property, use } = target;

    /**
     * Apply selector function, or use value directly
     */
    const selectorVal =
      typeof selector === "function" ? selector(value, el) : selector;

    /**
     * Find all matches for `selector` in `el`, and apply updates
     */
    await apply(
      el,
      selectorVal,
      /**
       * @param {Element} targetEl
       */
      async (targetEl) => {
        /**
         * Apply use function, or use value directly
         */
        const useValue = use ? use(value, el, targetEl) : value;

        if (attribute) {
          if ([null, false, undefined].includes(useValue)) {
            /**
             * Remove this attribute if new value is null/false/undefined
             */
            targetEl.removeAttribute(attribute);
          } else {
            /**
             * Update attribute with new value. If value is Boolean and true,
             * set attribute to empty string for consistency
             */
            targetEl.setAttribute(attribute, useValue === true ? "" : useValue);
          }
        }

        if (property) {
          /**
           * Update property unless
           */
          // @ts-ignore: allow to set any prop
          targetEl[property] = useValue;
        }

        if (text) {
          /**
           * Update element's text
           */
          targetEl.textContent = useValue;
        }

        if (dom) {
          /**
           * Apply DOM updates if defined
           */
          await dom(targetEl, useValue, el);
        }
      }
    );
  }
};

export { updateTargets };
