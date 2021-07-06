/**
 * Server implementation of Wafer
 *
 * @module WaferServer
 */

import { WaferMixin } from "../wafer-mixin.js";
import { ServerElement, parse } from "./element.js";
import { updateTargets } from "../common.js";
import { apply } from "./dom.js";

export default class WaferServer extends WaferMixin(ServerElement) {
  /**
   *
   * @param {import("../types").ServerOpts} opts
   * @param {import("../types").Registry} registry
   * Registry of components and their Wafer definitions that should be upgraded if
   * found in the component template
   */
  constructor({ shadow = "open", tagName, attrs = {} }, registry = {}) {
    /**
     * Initialise parent {@link ServerElement} with the tag name and any attributes
     * to set on initialisation
     */
    super(tagName, attrs);

    /**
     * Type of shadow root (open/closed) or falsey for none
     *
     * @type {import("../types").ShadowOpts}
     */
    this._shadow = shadow;

    /**
     * Tag name that this component will be rendered within
     *
     * @type {string}
     */
    this._tagName = tagName;

    /**
     * @type {import('../types').Registry}
     */
    this._registry = registry;

    /**
     * In the server context only remove unreflected attributes
     * if there is no intention to rehydrate on the client (since attribute
     * values are the source for rehydrating)
     */
    super._removeUnreflectedAttributes = !!(
      this._registry &&
      this._registry[tagName] &&
      this._registry[tagName].serverOnly
    );

    /**
     * Holds the server implementation of a shadow root if required
     *
     * @type {ServerElement | null}
     */
    this.shadowRoot = null;
  }

  /**
   * Called to initialise the component
   */
  async construct() {
    if (this._shadow) {
      /**
       * Attach a shadow root
       */
      const shadowRoot = this.attachShadow({ mode: this._shadow });

      /**
       * Render template as a series of {@link ServerElement}s
       */
      const template = await parse(
        /** @type {typeof WaferServer} */ (this.constructor).template,
        this._registry
      );

      /**
       * Append template contents into shadow root
       */
      for (const el of template.childNodes) {
        shadowRoot.appendChild(el);
      }
    }

    this.initialiseProps();
  }

  /**
   * Create and attach a shadow root, which on the server is an instance
   * of a template {@link ServerElement}
   *
   * @param {Object} opts
   * @param {"open"|"closed"} opts.mode
   * @returns {ServerElement}
   */
  attachShadow({ mode = "open" }) {
    this.shadowRoot = new ServerElement("template", {
      shadowroot: mode,
    });
    this.appendChild(this.shadowRoot);

    return this.shadowRoot;
  }

  /**
   * Called when an element is 'attached' to the DOM on the server. This is
   * called explicitly on the server before rendering takes place
   *
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    if (!this._connectedOnce) {
      /**
       * Initialise the component
       */
      if (!this.shadowRoot) {
        /**
         * The Light DOM is being used so stamp out the template
         * and append to element content as a series of {@link ServerElement}s
         */

        const container = await parse(
          /** @type {typeof WaferServer} */ (this.constructor).template,
          this._registry
        );

        /**
         * Append template contents into shadow root
         */
        for (const el of container.childNodes) {
          this.appendChild(el);
        }
      }

      if (!this._removeUnreflectedAttributes) {
        /**
         * Indicate to the client that this component should be
         * rehydrated on client
         */
        this.setAttribute("wafer-ssr", "");
      }

      this.setupPropValues();
    }

    /**
     * Wait for all initial rendering to complete
     */
    await this.updateDone();

    /**
     * Indicate the initial set up has been completed
     */
    super._connectedOnce = true;
  }

  /**
   * Returns true if the component has been rendered on the server
   * and has not yet been hydrated. Only true in client context
   *
   * @type {boolean}
   */
  get _needsRehydrating() {
    return false;
  }

  /**
   * Update the targets for property
   *
   * @param {string} name
   */
  updateTargets(name) {
    const value = this._props[name];
    const { targets = [] } = this.props[name];

    return updateTargets(apply, this, { value, targets });
  }

  /**
   * Proxy for `setAttribute` in {@link ServerElement} ensuring
   * `attributeChangedCallback` is called on this component
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
   * Proxy for `getAttribute` in {@link ServerElement} ensuring
   * `attributeChangedCallback` is called on this component
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
