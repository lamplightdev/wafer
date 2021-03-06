/**
 * Client implementation of Wafer
 *
 * @module WaferClient
 */

import { WaferMixin } from "./wafer-mixin.js";
import { stamp, apply, bindEvent } from "./dom.js";
import { updateTargets } from "./common.js";

let isSSR = false;

export default class WaferClient extends WaferMixin(HTMLElement) {
  /**
   * Does the current client context support Declarative Shadow DOM
   *
   * @type {boolean}
   */
  static get supportsDSD() {
    // eslint-disable-next-line no-prototype-builtins
    return HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot");
  }

  /**
   * @param {boolean} ssr
   */
  static set isSSR(ssr) {
    isSSR = ssr;
  }

  /**
   * Object keyed by a CSS Selector to an object mapping DOM event names
   * to the function that should be called when the event occurs. The function
   * will be automatically bound to the current element. Alternatively
   * the event name can map to a {@link TargetEvent} to enable binding to
   * different targets and/or use different event options
   *
   *
   * @type {Object.<string, import("./types").TargetEvents>}
   */
  get events() {
    return {};
  }

  /**
   *
   * @param {import("./types").ClientOpts} opts
   *
   */
  constructor({ shadow = "open" } = {}) {
    super();
    this.init(shadow);
  }

  /**
   *
   * @param {import("./types").ShadowOpts} shadow
   */
  init(shadow) {
    /**
     * If we want to use the ShadowDOM (else use LightDOM)
     */
    if (shadow) {
      /**
       * There will be no Shadow root yet, unless the component was rendered
       * on the server, and the browser supports DSD
       */
      if (!this.shadowRoot) {
        if (this._needsRehydrating) {
          /**
           * The component was rendered on the server and hasn't been
           * rehydrated yet
           **/
          if (
            !(/** @type {typeof WaferClient} */ (this.constructor).supportsDSD)
          ) {
            /**
             * There's no DSD support in the browser so move any shadowroot
             * template element into the Shadow DOM
             */
            const template = /** @type {HTMLTemplateElement} */ (
              this.querySelector("template[shadowroot]")
            );
            if (template) {
              const shadowRoot = this.attachShadow({
                mode: shadow,
              });
              shadowRoot.appendChild(template.content);
              template.remove();
            }
          }
        } else {
          /**
           * The component wasn't rendered on the server, so stamp out template
           * and append to Shadow DOM
           */
          this.attachShadow({ mode: shadow }).appendChild(
            stamp(/** @type {typeof WaferClient} */ (this.constructor).template)
          );
        }
      }
    }

    this.initialiseProps();
  }

  /**
   * Called when an element is attached to the DOM
   */
  connectedCallback() {
    if (!this._connectedOnce) {
      /**
       * If the component is being rendered on the server, but not
       * using WaferServer then unreflected attributes should not be removed
       */
      super._removeUnreflectedAttributes =
        !this.hasAttribute("x-ssr") || !isSSR;

      if (!this.hasAttribute("x-ssr") && isSSR) {
        this.setAttribute("wafer-ssr", "");
      }

      /**
       * Initialise the component
       */
      if (!this.shadowRoot && !this._needsRehydrating) {
        /**
         * The Light DOM is being used and wasn't rendered on the server so
         * stamp out the template and append to element content
         */
        this.appendChild(
          stamp(/** @type {typeof WaferClient} */ (this.constructor).template)
        );
      }

      this.setupPropValues();

      /**
       * Bind declared events
       */
      for (const selector of Object.keys(this.events)) {
        const eventNames = Object.keys(this.events[selector]);

        for (const name of eventNames) {
          bindEvent(this, selector, name, this.events[selector][name]);
        }
      }
    }

    /**
     * Indicate the initial set up has been completed
     */
    super._connectedOnce = true;
  }

  /**
   * Returns true if the component has been rendered on the server
   * and has not yet been rehydrated
   *
   * @type {boolean}
   */
  get _needsRehydrating() {
    return this._firstUpdate && this.hasAttribute("wafer-ssr") && !isSSR;
  }

  /**
   * Update the targets for property
   *
   * @param {string} name
   */
  updateTargets(name) {
    return updateTargets(apply, this, {
      value: this._props[name],
      targets: this.props[name].targets,
    });
  }
}
