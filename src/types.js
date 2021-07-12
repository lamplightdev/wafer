/**
 * Collection of typedefs used throughout Wafer
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
 * @typedef Prop - Property definition
 * @prop {StringConstructor | NumberConstructor | BooleanConstructor | ObjectConstructor | ArrayConstructor} type - Property type
 * @prop {any} [initial] - Initial value for property
 * @prop {boolean} [reflect=false] - Should the property be reflected to an attribute with the same name
 * @prop {Target[]} [targets=[]] - A list of targets that should be updated when the property value changes
 * @prop {string[]} [triggers=[]] - A list of other properties whose targets should be updated when this property changes
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
 * @param {Element | ServerElement} target
 * @param {any} value
 * @param {Element | ServerElement} el
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
 * @typedef ShadowOpts
 * @type {'open' | 'closed' | false}}
 */

/**
 * @typedef ClientOpts
 * @prop {ShadowOpts} [shadow]
 */

/**
 * @typedef ServerOpts
 * @prop {ShadowOpts} [shadow]
 * @prop {string} tagName
 * @prop {Object<string, string>} [attrs]
 */

/**
 * @typedef TargetEvent
 * @prop {(this: Element, ev: Event) => any} fn - Function to call
 * @prop {HTMLElement} [target] - Element to bind the function to
 * @prop {boolean | AddEventListenerOptions | undefined} [opts] - Listener options
 */

/**
 * @typedef {Object<string, ((this: Element, ev: Event) => any) | TargetEvent>} TargetEvents
 */

/**
 * @typedef ElOpts
 * @prop {'open' | 'closed' | false} [shadow]
 * @prop {string | ParserNode | ParserNode[] | null} [shadowContents]
 * @prop {ParserHTMLElement[]} [contents]
 * @prop {Object<string, any>} [attrs]
 * @prop {Target[]} [targets]
 */

/**
 * @typedef CustomElOpts
 * @prop {ParserHTMLElement[]} [contents]
 * @prop {Object<string, any>} [attrs]
 * @prop {Object<string, any>} [props]
 */

/**
 * @typedef ElInfo
 * @prop {Element} el
 * @prop {number} targetIndex
 * @prop {number} distance
 */

/**
 * @typedef Registry
 * @type {Object<string,{serverOnly?: boolean, def: new (...args: any[]) => WaferServer}>}
 */

exports.unused = {};
