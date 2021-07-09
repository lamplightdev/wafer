/**
 *
 * @module WaferMixin
 */

/**
 *
 * Mixin providing common functionality for controlling prop/attr relationships
 * and dynamic updates
 *
 * @template {new (...args: any[]) => any} T
 * @param {T} superclass - The class to extend
 */

export const WaferMixin = (superclass) =>
  class Wafer extends superclass {
    /**
     * Static template string
     *
     * @protected
     * @readonly
     * @type {string}
     */
    static get template() {
      return "";
    }

    /**
     * Property definitions
     *
     * @protected
     * @readonly
     * @type {Object<string, import("./types").Prop>}
     */
    static get props() {
      return {};
    }

    /**
     * Property definitions
     *
     * @protected
     * @readonly
     * @type Object<string, import("./types").Prop>
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

      /**
       * Flag indicating if element has been connected to DOM
       *
       * @protected
       * @type {boolean}
       */
      this._connected = false;

      /**
       * Array of property names
       *
       * @protected
       * @readonly
       * @type {string[]}
       */
      this._propNames = Object.keys(this.props);

      /**
       * Current values of properties
       *
       * @protected
       * @readonly
       * @type {Object<string, any>}
       */
      this._props = {};

      /**
       * Promise that will resolve when all the currently pending property
       * changes have been processed
       *
       * @private
       * @type {Promise<void> | null}
       */
      this._changePromise = null;

      /**
       * Promise that will resolve when all the current updates
       * have been triggered
       *
       * @private
       * @type {Promise<void> | null}
       */
      this._updatePromise = null;

      /**
       * Map of all properties to their values, that have changed in the current
       * update cycle
       *
       * @private
       * @readonly
       * @type {Map<String, any>}
       */
      this._toUpdate = new Map();

      /**
       * Flag indicating if this is the first update to occur
       *
       * @type {boolean}
       */
      this._firstUpdate = true;

      /**
       * Flag indicating if there are any pending changes in the current update
       * cycle
       *
       * @private
       * @type {boolean}
       */
      this._newChanges = false;

      /**
       * Flag indicating if this component is being constructed on the server
       * @protected
       * @type {boolean}
       */
      this._serverContext = false;

      /**
       * Initial values of properties
       * @protected
       * @type {Object<string,any>}
       */
      this._initials = {};
    }

    /**
     * Returns a setter method for named property
     *
     * @protected
     * @param {string} name - Property name
     * @returns {(value: any) => void}
     */
    _setter(name) {
      return (value) => {
        this._toUpdate.set(name, value);

        /**
         * indicate a new change has happened so that it can be processed
         * in the current update cycle
         */
        this._newChanges = true;

        this.triggerUpdate();
      };
    }

    /**
     * Returns a getter for named property
     *
     * @protected
     * @param {string} name - Property name
     * @returns {() => any}
     */
    _getter(name) {
      return () => {
        /**
         * Return the current pending change to this property or the current
         * property value if there is no pending change
         */
        return this._toUpdate.has(name)
          ? this._toUpdate.get(name)
          : this._props[name];
      };
    }

    /**
     * Sets property value from named attribute
     * @param {string} name - Property name
     * @param {string | null} value - Attribute value
     * @returns {void}
     */
    _setFromAttribute(name, value) {
      const { type } = this.props[name];

      if (value === null) {
        /**
         * For Boolean properties `null` indicated the attribute has been
         * removed, so the property should be set to `false`. For all other
         * types set the property value to `null`
         */
        this[name] = type === Boolean ? false : null;
        return;
      }

      switch (type) {
        case Number:
          this[name] = Number(value);
          return;
        case Boolean:
          /**
           * Any value set as a Boolean attributes indicates `true`
           */
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
     * Sets attribute from named property value
     *
     * @param {string} name - Property name
     * @param {any} value - Property value
     * @returns {void}
     */
    _setFromProp(name, value) {
      /**
       * For components rendered on the server and are being rehydrated
       * attribute values do not need to be set as the attributes will
       * have been set to their correct values on the server
       */
      if (!this.serverRendered()) {
        const { type, reflect } = this.props[name];

        /**
         * Don't update attribute if it's not reflected, nor if we are
         * rendering on the server and don't intend to rehydrate - in which
         * case setting the attribute is wasted bytes
         */
        if (reflect || (this._serverContext && !this._serverOnly)) {
          if (type === Boolean) {
            /**
             * Any truthy value sets a Boolean attribute to the empty string,
             * otherwise the attribute is removed
             */
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
                type !== Number && type !== String
                  ? JSON.stringify(value)
                  : value;
              this.setAttribute(name, valueString);
            }
          }
        }
      }
    }

    /**
     * Callback triggered when an attribute with a name matching a property
     * name is changed
     *
     * @param {string} name - Attribute name
     * @param {any} oldValue - Old attribute value
     * @param {any} newValue - New attribute value
     * @returns {void}
     */
    attributeChangedCallback(name, oldValue, newValue) {
      /**
       * Set the property from the new attribute value unless:
       *
       * - the component hasn't yet been added to the DOM - in which case
       * the attribute will be updated in `connectedCallback`.
       *
       * - or there are changes pending - in which case the attribute will
       * be updated after all changed has been processed with the final value
       *
       * - the value hasn't changed
       */
      if (this._connected && !this._changePromise && oldValue !== newValue) {
        this._setFromAttribute(name, newValue);
      }
    }

    /**
     * Trigger an update to the component that will be run at the end
     * of the current task
     */
    triggerUpdate() {
      this._changePromise =
        this._changePromise ||
        Promise.resolve().then(() => {
          return this.update(null);
        });
    }

    /**
     * Update property targets for all properties that are marked as changed
     *
     * @param {String[] | null} [props]
     * List of property names whose targets should be updated, even if
     * their value has not changed, in addition to the properties that have
     * changed.
     *
     * An empty array indicates all properties should have their targets
     * updated.
     *
     * `null` indicates that only those properties that have changed should
     * have their targets updated.
     *
     * @returns {void}
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
              const doNotUpdate = (await this.changed(changed)) || [];
              for (const name of changed.keys()) {
                if (doNotUpdate.includes(name)) {
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
     * Called when all pending property value changes have been processed,
     * but before their targets have been updated. Changes made to properties
     * in this callback will not trigger another update, but the updated values
     * will be used for the current update.
     *
     * @param {Map<String, any>} changed
     * A Map of properties and their old values that have changed in the
     * current cycle
     *
     * @returns {string[]|Promise<string[]>|void}
     * If an array of property names (or a Promise that resolves to an array) is
     * returned then those properties will not have their targets updated.
     *
     */
    // eslint-disable-next-line no-unused-vars
    changed(changed) {}

    /**
     *
     * Called when all pending property target updates have been called. Changes
     * made to properties in this callback will trigger another update cycle.
     *
     * @param {Map<String, any>} updated
     * A Map of properties and their old values that have had their targets
     * updated in the current cycle
     *
     * @returns {void|Promise<void>}
     */
    // eslint-disable-next-line no-unused-vars
    updated(updated) {}

    /**
     * Called after the initial update of this component has occurred.
     * @param {Map<String, any>} updated
     * @returns {void|Promise<void>}
     */
    // eslint-disable-next-line no-unused-vars
    firstUpdated(updated) {}

    /**
     * Manually request an update cycle to run
     *
     * @param {String[] | null} [props]
     * List of property names whose targets should be updated.
     *
     * An empty array indicates all properties should have their targets
     * updated.
     *
     * `null` indicates that no properties should have their targets updated.
     *
     * @returns {Promise<void>}
     */
    async requestUpdate(props = []) {
      /**
       * Wait for any pending update cycle to finish
       */
      await this.updateDone();

      this.update(props);
    }

    /**
     * Returns a promise that will resolve when the current update cycle is
     * complete, or immediately if there is no update pending.
     *
     * @returns {Promise<void>}
     */
    async updateDone() {
      await this._changePromise;
      await this._updatePromise;
    }

    /**
     * Returns true if the component has been rendered on the server
     * and has not yet been hydrated
     *
     * @returns {boolean}
     */
    serverRendered() {
      return false;
    }
  };
