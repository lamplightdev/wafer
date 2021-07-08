/**
 * Collection of typedefs used throughout Wafer
 *
 * @module Types
 */

/**
 * @typedef { import("node-html-parser").Node } ParserNode
 * @typedef { import("node-html-parser").HTMLElement } ParserHTMLElement
 * @typedef { import("./server/element").ServerElement } ServerElement
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
 * @typedef ClientOpts
 * @prop {'open' | 'closed' | false} [shadow]
 */

/**
 * @typedef ServerOpts
 * @prop {'open' | 'closed' | false} [shadow]
 * @prop {string} tagName
 * @prop {Object<string, string>} [attrs]
 */

/**
 * @typedef TargetEvent
 * @prop {(this: Element, ev: Event) => any} fn
 * @prop {HTMLElement} [target]
 * @prop {boolean | AddEventListenerOptions | undefined} [opts]
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

exports.unused = {};
