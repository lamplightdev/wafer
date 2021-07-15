/**
 * Collection of type definitions used throughout Wafer
 *
 * @module Types
 */

/**
 * @typedef { import("node-html-parser").Node } ParserNode
 * @typedef { import("node-html-parser").HTMLElement } ParserHTMLElement
 * @typedef { import("./server/element").ServerElement } ServerElement
 * @typedef { import("./server/wafer").WaferServer } WaferServer
 */

/**
 * @typedef Prop - Property declaration
 * @prop {StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor} type - Property type
 * @prop {any} [initial] - Initial value for property
 * @prop {boolean} [reflect=false] - Should the property be reflected to an attribute with the same name
 * @prop {Target[]} [targets=[]] - A list of targets that should be updated when the property value changes
 * @prop {string[]} [triggers=[]] - A list of other properties whose targets should be updated when this property changes
 * @prop {string} [attributeName] - The name of the attribute this property can be initialised from / reflected to
 */

/**
 * @typedef Target
 * Target declaration defining how to update elements matching `selector`
 * @prop {string | ((value: any) => string)} selector CSS3 selector
 * @prop {string} [attribute] - which attribute on matches to update with the property value
 * @prop {string} [property]  - which property on matches to update with the property value
 * @prop {boolean} [text=false] - should the textContent of matches be set to the property value
 * @prop {DOMUpdateFn} [dom] - a function that will be called when the property value changes - usually used for general DOM updates
 * @prop {UseFn} [use] - a function that returns the value that should be used in updates (defaults to the property value itself)
 */

/**
 * @callback DOMUpdateFn - Function to run for a {@link ./Target} when a property value changes
 * @param {Element | ServerElement} target - The target element itself
 * @param {any} value - The property value (or the value returned from `use` if defined)
 * @param {Element | ServerElement} el - Reference to the component
 * @returns {Promise<string | void> | void} - In the server context only a returned promise will be `await`ed
 */

/**
 * @callback UseFn - Function to run before updating {@link ./Target}s, returning the value to use in updates
 * @param {any} value - The new property value
 * @param {HTMLElement | {}} el - Reference to the component
 * @param {HTMLElement | {}} [targetEl] - Reference to the target element
 * @returns {any} - The value to use in updates, in place of the new property value
 */

/**
 * @typedef ShadowOpts - If an what type of Shadow Root to attach
 * @type {'open' | 'closed' | false} - False indicates no Shadow Root
 */

/**
 * @typedef ClientOpts - Possible arguments passed to client constructor
 * @prop {ShadowOpts} [shadow] - What type of Shadow Root to attach
 */

/**
 * @typedef ServerOpts - Possible arguments passed to server constructor
 * @prop {ShadowOpts} [shadow] - What type of Shadow Root to attach
 * @prop {string} tagName - What tag should this component be defined with
 * @prop {Object.<string, string>} [attrs] - Object of initial attribute name/values
 */

/**
 * @typedef TargetEvent - Explicit event handler
 * @prop {(this: Element, ev: Event) => any} fn - Function to call
 * @prop {HTMLElement} [target] - Element to bind the function to
 * @prop {boolean | AddEventListenerOptions | undefined} [opts] - Event listener options
 */

/**
 * @typedef TargetEvents - Object of event names to event handlers
 * @type {Object.<string, ((this: Element, ev: Event) => any) | TargetEvent>} - explicit {@link TargetEvent} definition, or a function that will be automatically bound to the component
 */

/**
 * @typedef RegistryEntry
 * @prop {new (...args: any[]) => WaferServer} def - The component definition
 * @prop {boolean} [serverOnly] - If this component is intended only to be rendered on server (i.e. not upgraded or rehydrated on client)
 */

/**
 * @typedef Registry - Object of tag names to Wafer component definitions
 * @type {Object.<string,RegistryEntry>}
 */

export {};
