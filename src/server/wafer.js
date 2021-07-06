import { Mixin } from "../wafer-mixin.js";
import { HTMLServerElement, render } from "./element.js";
import { updateTargets } from "../common.js";
import { apply } from "./helpers.js";

/**
 * @typedef Opts
 * @prop {'open' | 'closed' | false} [shadow]
 * @prop {string} tagName
 * @prop {Object<string, string>} [attrs]
 */

/**
 * @typedef {Object} Updates
 * @prop {{name: string, value: string}} [attribute]
 * @prop {{name: string, value: any}} [property]
 * @prop {string} [text]
 * @prop {string | void} [dom]
 */

export class WaferServer extends Mixin(HTMLServerElement) {
  static get observedAttributes() {
    return Object.keys(this.props);
  }

  /**
   *
   * @param {Opts} opts
   * @param {Object<string,{serverOnly?: boolean, def: new (...args: any[]) => WaferServer}>} registry
   */
  constructor({ shadow = "open", tagName, attrs = {} }, registry = {}) {
    super(tagName, attrs);

    this._shadow = shadow;
    this._tagName = tagName;
    this._registry = registry;

    this._serverContext = true;
    this._serverOnly =
      this._registry &&
      this._registry[tagName] &&
      this._registry[tagName].serverOnly;

    /**
     * @type Object<string,any>
     */
    this._initials = {};

    /**
     * @type {HTMLServerElement | null}
     */
    this.shadowRoot = null;
  }

  async construct() {
    if (this._shadow) {
      this.attachShadow({ mode: this._shadow });

      if (this.shadowRoot) {
        const container = await render(
          /** @type {typeof WaferServer} */ (this.constructor).template,
          this._registry
        );
        for (const el of container.childNodes) {
          this.shadowRoot.appendChild(el);
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

  attachShadow({ mode = "open" }) {
    this.shadowRoot = new HTMLServerElement("template", {
      shadowroot: mode,
    });
    this.appendChild(this.shadowRoot);

    return this.shadowRoot;
  }

  async connectedCallback() {
    if (!this._connected) {
      if (!this.shadowRoot) {
        const container = await render(
          /** @type {typeof WaferServer} */ (this.constructor).template,
          this._registry
        );
        for (const el of container.childNodes) {
          this.appendChild(el);
        }
      }

      if (!this._serverOnly) {
        this.setAttribute("wafer-ssr", "");
      }

      for (const name of this._propNames) {
        if (this[name] === undefined) {
          if (this.hasAttribute(name)) {
            const { reflect } = this.props[name];
            this._setFromAttribute(name, this.getAttribute(name));

            if (this._serverOnly && !reflect) {
              // remove any initial attribute set from server render if not reflected
              // and we don't need them for rehydration (since this is server only)
              this.removeAttribute(name);
            }
          } else {
            this[name] = this._initials[name];
          }
        } else {
          this._setFromProp(name, this[name]);
        }
      }
    }

    await this.updateDone();
    this._connected = true;
  }

  serverRendered() {
    return false;
  }

  /**
   *
   * @param {string} name
   */
  updateTargets(name) {
    const value = this._props[name];
    const { targets = [] } = this.props[name];

    return updateTargets(apply, this, { value, targets });
  }

  /**
   *
   * @param {string} key
   * @param {string} value
   */
  setAttribute(key, value) {
    const oldValue = this.getAttribute(key);
    super.setAttribute(key, value);

    if (
      /** @type {typeof WaferServer} */ (
        this.constructor
      ).observedAttributes.includes(key)
    ) {
      this.attributeChangedCallback(key, oldValue, value);
    }
  }

  /**
   *
   * @param {string} key
   */
  removeAttribute(key) {
    const oldValue = this.getAttribute(key);
    super.removeAttribute(key);

    if (
      /** @type {typeof WaferServer} */ (
        this.constructor
      ).observedAttributes.includes(key)
    ) {
      this.attributeChangedCallback(key, oldValue, null);
    }
  }
}
