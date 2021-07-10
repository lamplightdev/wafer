/**
 * Client implementation of Wafer
 *
 * @module WaferClient
 */

import { WaferMixin } from "./wafer-mixin.js";
import { stamp, apply, bindEvent } from "./helpers.js";
import { updateTargets } from "./common.js";

class WaferClient extends WaferMixin(HTMLElement) {
  static get supportsDSD() {
    // eslint-disable-next-line no-prototype-builtins
    return HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot");
  }

  static get observedAttributes() {
    return Object.keys(this.props);
  }

  /**
   * @type Object<string, import("./types").TargetEvents>
   */
  get events() {
    return {};
  }

  /**
   *
   * @param {import("./types").ClientOpts} opts
   */
  constructor({ shadow = "open" } = {}) {
    super();

    if (shadow) {
      if (!this.shadowRoot) {
        if (this.serverRendered()) {
          if (
            !(/** @type {typeof WaferClient} */ (this.constructor).supportsDSD)
          ) {
            // DSD not supported
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
          this.attachShadow({ mode: shadow }).appendChild(
            stamp(/** @type {typeof WaferClient} */ (this.constructor).template)
          );
        }
      }
    }

    for (const name of this._propNames) {
      const { initial } = this.props[name];
      this._initials[name] = this[name] !== undefined ? this[name] : initial;
      Object.defineProperty(this, name, {
        set: this._setter(name),
        get: this._getter(name),
      });
    }
  }

  connectedCallback() {
    if (!this._connected) {
      if (!this.shadowRoot && !this.serverRendered()) {
        // Light DOM
        this.appendChild(
          stamp(/** @type {typeof WaferClient} */ (this.constructor).template)
        );
      }

      for (const name of this._propNames) {
        if (this[name] === undefined) {
          if (this.hasAttribute(name)) {
            const { reflect } = this.props[name];
            this._setFromAttribute(name, this.getAttribute(name));

            if (!reflect) {
              // remove any initial attribute set from server render if not reflected
              this.removeAttribute(name);
            }
          } else {
            this[name] = this._initials[name];
          }
        } else {
          this._setFromProp(name, this[name]);
        }
      }

      for (const selector of Object.keys(this.events)) {
        const eventNames = Object.keys(this.events[selector]);

        for (const name of eventNames) {
          const def = this.events[selector][name];

          bindEvent(this, selector, name, def);
        }
      }
    }

    super._connected = true;
  }

  /**
   * Returns true if the component has been rendered on the server
   * and has not yet been hydrated
   */
  serverRendered() {
    return this._firstUpdate && this.hasAttribute("wafer-ssr");
  }

  /**
   *
   * @param {string} name
   */
  updateTargets(name) {
    const value = this._props[name];
    const { targets = [] } = this.props[name];

    updateTargets(apply, this, { value, targets });
  }
}

export { WaferClient as Wafer };
