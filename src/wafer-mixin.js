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
     * @type {string}
     */
    static get template() {
      return "";
    }

    /**
     * Property definitions
     *
     * @type {Object.<string, import("./types").Prop>}
     */
    static get props() {
      return {};
    }

    /**
     * A list of all attributes whose values should be used to set
     * properties
     *
     * @type {string[]}
     */
    static get observedAttributes() {
      return Object.keys(this.props);
    }

    /**
     * Property definitions Prop
     *
     * @type {Object.<string, import("./types").Prop>}
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
       * Flag indicating if element has been connected to DOM at least once
       *
       * @type {boolean}
       */
      this._connectedOnce = false;

      /**
       * Array of property names
       *
       * @type {string[]}
       */
      this._propNames = Object.keys(this.props);

      /**
       * Current values of properties
       * <string, any>
       *
       * @type {Object.<string, any>}
       */
      this._props = {};

      /**
       * Promise that will resolve when all the currently pending property
       * changes have been processed
       *
       * @type {Promise<void> | null}
       */
      this._changePromise = null;

      /**
       * Promise that will resolve when all the current updates
       * have been triggered
       *
       * @type {Promise<void> | null}
       */
      this._updatePromise = null;

      /**
       * Map of all properties to their new values, that have changed in the
       * current update cycle
       *
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
       * @type {boolean}
       */
      this._newChanges = false;

      /**
       * Indicates if unreflected attributes should be removed
       * on initialisation
       *
       * @type {boolean}
       */
      this._removeUnreflectedAttributes = true;

      /**
       * Initial values of properties
       * @type {Object.<string, any>}
       */
      this._initials = {};
    }

    /**
     * Returns a setter method for named property
     *
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
     * Set up initial values of properties
     *
     * @returns {void}
     */
    initialiseProps() {
      for (const name of this._propNames) {
        /**
         * Grab any initial property values (i.e. values set imperatively, before
         * this element was upgraded) or use declared initial values and
         * store for use in `connectedCallback`
         */
        const { initial } = this.props[name];
        this._initials[name] = this[name] !== undefined ? this[name] : initial;

        /**
         * Define our setter/getter pairs for each declared property so they
         * can be intercepted in order to batch updates
         */
        Object.defineProperty(this, name, {
          set: this._setter(name),
          get: this._getter(name),
        });
      }
    }

    /**
     * Set initial property values
     *
     * @returns {void}
     */
    setupPropValues() {
      for (const name of this._propNames) {
        if (this[name] === undefined) {
          /**
           * No property has been set either before or after construction
           */
          if (this.hasAttribute(name)) {
            /**
             * Initialise from attribute value if there is one
             */
            this._setFromAttribute(name, this.getAttribute(name));

            if (
              this._removeUnreflectedAttributes &&
              !this.props[name].reflect
            ) {
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
       * For components rendered on the server and that are rehydrating,
       * attribute values do not need to be set as the attributes will
       * have been set to their correct values on the server
       */
      if (!this._needsRehydrating) {
        const { type, reflect } = this.props[name];

        /**
         * Don't update attribute if it's not reflected, nor if we are
         * rendering on the server and don't intend to rehydrate - in which
         * case setting the attribute is wasted bytes
         */
        if (reflect || !this._removeUnreflectedAttributes) {
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
      if (
        this._connectedOnce &&
        !this._changePromise &&
        oldValue !== newValue
      ) {
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
     * Update property targets for all properties whose values have changed or
     * have been manually requested
     *
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
      /**
       * List of properties that have been manually requested to be updated
       * irrespective of whether their values have changed
       *
       * @type {string[]}
       */
      const propNames = props ? (props.length ? props : this._propNames) : [];

      /**
       * Promise that resolves when all targets in this cycle have been
       * applied
       **/
      this._updatePromise =
        this._updatePromise ||
        Promise.resolve().then(async () => {
          /**
           * Map of property names whose value has changed (or was manually
           * requested) to their new (existing) values
           *
           * @type {Map<string, any>}
           */
          const allToUpdate = new Map();

          /**
           * Object of property name/values containing all the properties and
           * their values at the point the update was initiated
           *
           * @type {Object.<string, any>}
           */
          const initialValues = {
            ...this._props,
          };

          /**
           * Object of property names whose targets should *not* be updated
           *
           * @type {Object.<string, boolean>}
           */
          const noUpdate = {};

          /**
           * Add all manually requested property names to the `_toUpdate` map
           */
          if (propNames.length) {
            /**
             * indicate that there are changes to process - `_newChanges` would
             * be `false` at this point if there are only manual changes to
             * process, so flip it to true
             */
            this._newChanges = true;

            for (const propName of propNames) {
              /**
               * Only add the prop if it's not already there - don't want to
               * clobber any existing new value
               */
              if (!this._toUpdate.has(propName)) {
                /**
                 * Set the value in the map to the existing value, which for
                 * a manual update is the 'new' value
                 */
                this._toUpdate.set(propName, this[propName]);
              }
            }
          }

          /**
           * Continue to process changes until there are no new changes
           */
          while (this._newChanges) {
            /**
             * Map of property names whose values have changed to their
             * old values
             *
             * @type {Map<string, any>}
             */
            const changed = new Map();

            /**
             * Cycle through all properties that have had their values changed
             * or who have been manually requested
             */
            for (const [name, value] of this._toUpdate.entries()) {
              if (this._props[name] === value && !propNames.includes(name)) {
                /**
                 * Remove any properties whose new value is now equal to the old
                 * value as long as they haven't been manually requested
                 */
                allToUpdate.delete(name);
                changed.delete(name);
              } else {
                /**
                 * Add the property and it's new value to the list of properties
                 * whose targets should be updated
                 */
                allToUpdate.set(name, value);
                /**
                 * Add the property and it's old (existing) value to the list
                 * of properties that have changed
                 */
                changed.set(name, this._props[name]);

                /**
                 * Update the current value of the property to the new value
                 */
                this._props[name] = value;
              }
            }

            /**
             * Indicate all changed have been processed. Note: this may be
             * flipped back to true if a property is updated in the `changed`
             * callback
             */
            this._newChanges = false;

            /**
             * Clear the update map
             */
            this._toUpdate.clear();

            if (changed.size > 0) {
              /**
               * List of properties whose targets should not be updated
               * (as returned from the changed callback)
               *
               * @type {string[]}
               */
              const doNotUpdate = (await this.changed(changed)) || [];

              /**
               * Include the properties in `doNotUpdate` in the definitive
               * list of properties whose targets should not be updated, but
               * remove properties from the same list that where included
               * previously but have since changed (and have not had their
               * name returned from the `changed` callback again)
               */
              for (const name of changed.keys()) {
                if (doNotUpdate.includes(name)) {
                  noUpdate[name] = true;
                } else {
                  delete noUpdate[name];
                }
              }
            }
          }

          /**
           * Map of property names whose targets will be updated to their
           * old values
           *
           * @type {Map<string, any>}
           */
          const updated = new Map();

          /**
           * For all properties whose targets should be updated (due to value
           * changes, or manual request)
           */
          for (const [name] of allToUpdate.entries()) {
            /**
             * The new property value
             *
             * @type {any}
             */
            const value = this[name];

            /**
             * For all properties whose value has changed or been manually
             * requested
             */
            if (initialValues[name] !== value || propNames.includes(name)) {
              /**
               * Update the attribute from the new property value
               */
              this._setFromProp(name, value);

              /**
               * Add the property and old value to list of properties whose
               * targets should be updated, unless it has been marked otherwise
               */
              if (!noUpdate[name]) {
                updated.set(name, initialValues[name]);
              }
            }
          }

          /**
           * Indicate the current changes have all been processed
           */
          this._changePromise = null;

          if (updated.size > 0) {
            /**
             * Don't apply updates if the element was rendered on the server
             * and this is the rehydration update
             */
            if (!this._needsRehydrating) {
              /**
               * List of properties whose targets should be updated
               *
               * @type {string[]}
               */
              const updatedProps = [...updated.keys()];

              /**
               * Object of other properties whose targets should be updated
               * due to being defined as being triggered by another component
               * change
               *
               * @type {Object.<string, boolean>}
               */
              const otherTriggers = {};

              for (const name of updatedProps) {
                const {
                  /**
                   * Properties that are listed as being triggered by this
                   * property
                   *
                   * @type {string[]}
                   */
                  triggers = [],
                } = this.props[name];

                /**
                 * Update all targets of this property. The result is `await`ed
                 * for when used in the server context where updates need to be
                 * applied before being sent in the response
                 */
                await this.updateTargets(name);

                /**
                 * Update master list of other properties whose targets should
                 * be updated
                 *
                 */
                for (const trigger of triggers) {
                  otherTriggers[trigger] = true;
                }
              }

              /**
               * Update the properties that were listed as triggers of
               * changed properties
               */
              for (const name of Object.keys(otherTriggers)) {
                /**
                 * Don't run the updates if they have already been run
                 */
                if (!updatedProps.includes(name)) {
                  await this.updateTargets(name);
                }
              }
            }

            /**
             * Indicate the current updates have all been processed
             */
            this._updatePromise = null;

            if (this._firstUpdate) {
              this._firstUpdate = false;
              await this.firstUpdated(updated);
            }

            /**
             * The response is `await`ed so that in the server context if
             * further work is initiated that results in property changes
             * (and targets updated), the response shouldn't be set until all
             * changes have been processed
             */
            await this.updated(updated);
          } else {
            /**
             * Indicate the current updates have all been processed, and
             * the next update will not be the first
             */
            this._updatePromise = null;
            this._firstUpdate = false;
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
     * returned then those properties will not have their targets updated. If
     * a promise is returned then it will be `await`ed
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
     * updated in the current cycle.
     *
     * @returns {void|Promise<void>}
     * If a promise is returned then it will be
     * `await`ed - this is useful in a server context where, if further work is
     * initiated that results in property changes (and targets updated), the
     * response shouldn't be set until all changes have been processed.
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
  };
