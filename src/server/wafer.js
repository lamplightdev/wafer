/**
 * Server implementation of Wafer
 *
 * @module WaferServer
 */

import { WaferMixin } from "../wafer-mixin.js";
import { ServerElement, render } from "./element.js";
import { updateTargets } from "../common.js";
import { apply } from "./helpers.js";

export class WaferServer extends WaferMixin(ServerElement) {
  static get observedAttributes() {
    return Object.keys(this.props);
  }

  /**
   *
   * @param {import("../types").ServerOpts} opts
   * @param {Object<string,{serverOnly?: boolean, def: new (...args: any[]) => WaferServer}>} registry
   */
  constructor({ shadow = "open", tagName, attrs = {} }, registry = {}) {
    super(tagName, attrs);

    super._serverContext = true;

    this._shadow = shadow;
    this._tagName = tagName;
    this._registry = registry;

    this._serverOnly =
      this._registry &&
      this._registry[tagName] &&
      this._registry[tagName].serverOnly;

    /**
     * @type {ServerElement | null}
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
    this.shadowRoot = new ServerElement("template", {
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

    super._connected = true;
  }

  /**
   * Returns true if the component has been rendered on the server
   * and has not yet been hydrated. Only true in client context
   */
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
