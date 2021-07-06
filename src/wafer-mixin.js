/**
 * @typedef { import("./server/element").HTMLServerElement } HTMLServerElement
 */

/**
 * @typedef Prop
 * @prop {StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor} type
 * @prop {any} [initial]
 * @prop {boolean} [reflect=false]
 * @prop {Target[]} [targets=[]]
 * @prop {string[]} [triggers=[]]
 */

/**
 * @typedef Target
 * @prop {string | ((value: any) => string)} selector
 * @prop {string} [attribute]
 * @prop {string} [property]
 * @prop {boolean} [text=false]
 * @prop {DOMUpdateFn} [dom]
 * @prop {UseFn} [use]
 */

/**
 * @callback DOMUpdateFn
 * @param {Element | HTMLServerElement} target
 * @param {any} value
 * @param {Element | HTMLServerElement} el
 * @returns {Promise<string | void> | void}
 */

/**
 * @callback UseFn
 * @param {any} value
 * @param {HTMLElement | {}} el
 * @param {HTMLElement | {}} [targetEl]
 * @returns {any}
 */

/**
 * @template {new (...args: any[]) => any} T
 * @param {T} superclass - The class to extend
 */

export const Mixin = (superclass) =>
  class Wafer extends superclass {
    static get template() {
      return "";
    }

    /**
     * @type Object<string, Prop>
     */
    static get props() {
      return {};
    }

    /**
     * @type Object<string, Prop>
     */
    get props() {
      return /** @type {typeof Wafer} */ (this.constructor).props;
    }

    /**
     *
     * @param  {...any} args
     */
    constructor(...args) {
      super(...args);

      this._connected = false;

      this._propNames = Object.keys(this.props);
      /**
       * Prop values
       * @type Object<string, any>
       */
      this._props = {};
      /**
       * @type {Promise<void> | null}
       */
      this._changePromise = null;
      /**
       * @type {Promise<void> | null}
       */
      this._updatePromise = null;
      /**
       * @type {Map<String, any>}
       */
      this._toUpdate = new Map();
      this._firstUpdate = true;
      this._newChanges = false;
    }

    /**
     *
     * @param {string} name
     * @returns
     */
    _setter(name) {
      return (/** @type {any} */ value) => {
        if (this._toUpdate.has(name)) {
          if (this._toUpdate.get(name) === value) {
            return;
          }
        } else if (this[name] === value) {
          this._toUpdate.delete(name);
          return;
        }

        this._toUpdate.set(name, value);
        this._newChanges = true;

        this.triggerUpdate();
      };
    }

    triggerUpdate() {
      this._changePromise =
        this._changePromise ||
        Promise.resolve().then(() => {
          return this.update(null);
        });
    }

    /**
     *
     * @param {string} name
     * @returns
     */
    _getter(name) {
      return () => {
        return this._toUpdate.has(name)
          ? this._toUpdate.get(name)
          : this._props[name];
      };
    }

    /**
     *
     * @param {string} name
     * @param {string | null} value
     */
    _setFromAttribute(name, value) {
      const { type } = this.props[name];

      if (value === null) {
        this[name] = type === Boolean ? false : null;
        return;
      }

      switch (type) {
        case Number:
          this[name] = Number(value);
          return;
        case Boolean:
          this[name] = true;
          return;
        case String:
          this[name] = value;
          break;
        default:
          this[name] = JSON.parse(value);
          return;
      }
    }

    /**
     *
     * @param {string} name
     * @param {any} value
     */
    _setFromProp(name, value) {
      if (!this.serverRendered()) {
        const { type, reflect } = this.props[name];

        if (reflect || (this._serverContext && !this._serverOnly)) {
          if (type === Boolean) {
            if ([null, false].includes(value)) {
              if (this.hasAttribute(name)) {
                this.removeAttribute(name);
              }
            } else {
              this.setAttribute(name, "");
            }
          } else {
            if (value === null) {
              this.removeAttribute(name);
            } else {
              const valueString =
                type === Object || type === Array
                  ? JSON.stringify(value)
                  : value;
              this.setAttribute(name, valueString);
            }
          }
        }
      }
    }

    /**
     *
     * @param {string} name
     * @param {any} oldValue
     * @param {any} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (this._connected && !this._changePromise && oldValue !== newValue) {
        this._setFromAttribute(name, newValue);
      }
    }

    /**
     *
     * @param {String[] | null} [props]
     */
    update(props = []) {
      const propNames = props ? (props.length ? props : this._propNames) : [];

      this._updatePromise =
        this._updatePromise ||
        Promise.resolve().then(async () => {
          const allToUpdate = new Map();
          const initialValues = {
            ...this._props,
          };

          /**
           * @type {Object<string, boolean>}
           */
          let noUpdate = {};

          if (propNames.length) {
            this._newChanges = true;
            for (const propName of propNames) {
              if (!this._toUpdate.has(propName)) {
                this._toUpdate.set(propName, this[propName]);
              }
            }
          }

          while (this._newChanges) {
            const changed = new Map();

            for (const [name, value] of this._toUpdate.entries()) {
              if (this._props[name] === value && !propNames.includes(name)) {
                allToUpdate.delete(name);
                changed.delete(name);
              } else {
                allToUpdate.set(name, value);
                changed.set(name, this._props[name]);
                this._props[name] = value;
              }
            }

            this._newChanges = false;
            this._toUpdate.clear();

            if (changed.size > 0) {
              const dontUpdate = (await this.changed(changed)) || [];
              for (const name of changed.keys()) {
                if (dontUpdate.includes(name)) {
                  noUpdate[name] = true;
                } else {
                  delete noUpdate[name];
                }
              }
            }
          }

          const updated = new Map();

          for (const [name] of allToUpdate.entries()) {
            const value = this[name];

            if (initialValues[name] !== value || propNames.includes(name)) {
              this._setFromProp(name, value);

              if (!noUpdate[name]) {
                updated.set(name, initialValues[name]);
              }
            }
          }

          this._changePromise = null;

          if (updated.size > 0) {
            if (!this.serverRendered()) {
              const updatedProps = [...updated.keys()];

              /** @type {Object<string, boolean>} */
              const otherTriggers = {};

              for (const name of updatedProps) {
                const { triggers = [] } = this.props[name];
                await this.updateTargets(name);

                for (const trigger of triggers) {
                  otherTriggers[trigger] = true;
                }
              }

              for (const name of Object.keys(otherTriggers)) {
                if (!updatedProps.includes(name)) {
                  await this.updateTargets(name);
                }
              }
            }

            this._updatePromise = null;

            if (this._firstUpdate) {
              await this.firstUpdated(updated);
            }

            await this.updated(updated);
            this._firstUpdate = false;
          } else {
            this._updatePromise = null;
          }
        });
    }

    /**
     * A Map of changed props
     *
     * @param {Map<String, any>} changed
     * @returns {any[]|Promise<any[]>|void}
     */
    // eslint-disable-next-line no-unused-vars
    changed(changed) {}

    /**
     *
     * @param {Map<String, any>} updated
     * @returns {void|Promise<void>}
     */
    // eslint-disable-next-line no-unused-vars
    updated(updated) {}

    /**
     *
     * @param {Map<String, any>} updated
     * @returns {void|Promise<void>}
     */
    // eslint-disable-next-line no-unused-vars
    firstUpdated(updated) {}

    /**
     *
     * @param {String[] | null} [props]
     */
    async requestUpdate(props = []) {
      await this.updateDone();
      this.update(props);
    }

    async updateDone() {
      await this._changePromise;
      await this._updatePromise;
    }
  };
