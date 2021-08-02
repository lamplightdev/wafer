/**
 * Server implementation of DOM Element
 *
 * @module ServerElement
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { parse, HTMLElement } = require("node-html-parser");

/**
 * Escape values for attributes and text content
 * @param {any} unsafe
 * @returns {any}
 */
const escape = (unsafe) => {
  if (typeof unsafe !== "string") {
    return unsafe;
  }

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Provides an interface compatible with the browser `HTMLElement` - at least
 * in so much as it provides the capabilities Wafer requires. The actual
 * implementation is proxied to node-html-parser implementation of
 * `HTMLElement`. It should be relatively straight forward to swap this
 * implementation out for an alternative one if required.
 */
class ServerElement {
  /**
   * @param {string} tagName - the tag name of this element
   * @param {Object.<string,string>} attrs - Object of initial attribute name/value pairs
   */
  constructor(tagName, attrs = {}) {
    /**
     * Element containing reference to underlying `HTMLElement` implementation.
     * The element is proxied in this class to:
     *
     * - avoid clashes with `HTMLElement` implementation details
     *
     * - make it easy to swap out for alternative implementations
     */
    this._element = /** @type { ServerElement} **/ (
      /** @type { unknown } **/
      (new HTMLElement(tagName, {}, "", null))
    );
    this._element.setAttributes(attrs);
  }

  /**
   * Update the underlying element to new element
   * @param {ServerElement} element
   */
  setElement(element) {
    this._element = element;
  }

  /**
   * Retrieve the underlying element
   *
   * @returns {ServerElement}
   */
  getElement() {
    return this._element;
  }

  /**
   * Does this element have an attribute set with named `key`
   *
   * @param {string} key - Attribute name
   * @returns {boolean}
   */
  hasAttribute(key) {
    return this._element.hasAttribute(key);
  }

  /**
   * Return the current value of names attribute
   *
   * @param {string} key - Attribute name
   * @returns {string}
   */
  getAttribute(key) {
    return this._element.getAttribute(key);
  }

  /**
   * Sets the value for the name attribute
   *
   * @param {string} key - Attribute name
   * @param {string} value - Value to set
   * @returns
   */
  setAttribute(key, value) {
    this._element.setAttribute(key, escape(value));
  }

  /**
   * Sets all attributes at once
   *
   * @param {Object.<string, string>} attrs - Value to set
   * @returns
   */
  setAttributes(attrs) {
    /**
     * @type {Object.<string, string>}
     */
    const escaped = {};

    for (const [name, value] of Object.entries(attrs)) {
      escaped[name] = escape(value);
    }

    this._element.setAttributes(escaped);
  }

  /**
   * Remove names attribute
   *
   * @param {string} key - Attribute name
   */
  removeAttribute(key) {
    this._element.removeAttribute(key);
  }

  /**
   * Append a child to the underlying element implementation
   *
   * @param {ServerElement} el - Element to append
   * @returns {void}
   */
  appendChild(el) {
    return this._element.appendChild(el.getElement());
  }

  /**
   * Query underlying element for single match
   *
   * @param {string} selector - CSS3 selector
   * @returns {ServerElement}
   */
  querySelector(selector) {
    return this._element.querySelector(selector);
  }

  /**
   * Query underlying element for all matches
   *
   * @param {string} selector
   * @returns {ServerElement[]}
   */
  querySelectorAll(selector) {
    return this._element.querySelectorAll(selector);
  }

  /**
   * The element's tag name
   *
   * @returns {string}
   */
  get tagName() {
    return this._element.tagName;
  }

  /**
   * Object containing the element's attributes
   *
   * @returns {Object.<string, string>}
   */
  get attributes() {
    return this._element.attributes;
  }

  /**
   * The first child of this element
   *
   * @returns {ServerElement}
   */
  get firstChild() {
    return this._element.firstChild;
  }

  /**
   * Set the child nodes of this element
   *
   * @returns
   */
  set childNodes(nodes) {
    this._element.childNodes = nodes;
  }

  /**
   * The child nodes of this element
   *
   * @returns {ServerElement[]}
   */
  get childNodes() {
    return this._element.childNodes;
  }

  /**
   *  The parent of this element
   *
   * @returns {ServerElement}
   */
  set parentNode(node) {
    this._element.parentNode = node;
  }

  /**
   *  The parent of this element
   *
   * @returns {ServerElement}
   */
  get parentNode() {
    return this._element.parentNode;
  }

  /**
   * Element's node type
   *
   * @returns {import('node-html-parser').NodeType}
   */
  get nodeType() {
    return this._element.nodeType;
  }

  /**
   * The tag name of the original element. This is used internally by
   * node-html-parser and needs to br proxied here so a ServerElement can
   * be used everywhere node-html-parser's HTMLElement is
   *
   * @returns {string}
   */
  get rawTagName() {
    return this._element.rawTagName;
  }

  /**
   * Set the text content of underlying element
   * @param {string} content
   */
  set textContent(content) {
    this._element.textContent = escape(content);
  }

  /**
   * Get the text content of underlying element
   *
   * @returns {string}
   */
  get textContent() {
    return this._element.textContent;
  }

  /**
   * Set the innerHTML of underlying element
   *
   * @param {string} html
   */
  set innerHTML(html) {
    this._element.innerHTML = html;
  }

  /**
   * Render this element to an HTML string
   *
   * @returns {string}
   */
  toString() {
    return this._element.toString();
  }

  /**
   * Promise resolves when all pending updates have been processed
   *
   * @param {import("../types").Registry} registry - registry of tag names to Wafer component definitions
   *
   * @returns {Promise<void>}
   */
  async updateDone(registry) {
    for (const child of this.childNodes) {
      await child.updateDone(registry);
    }

    if (registry[this.tagName && this.tagName.toLowerCase()]) {
      await this.updateDone(registry);
    }
  }
}

/**
 * Convert an instance of node-html-parser's HTMLElement into a ServerElement
 * instance
 *
 * @param {ServerElement} el - the HTMLElement instance
 * @param {import("../types").Registry} registry - registry of tag names to Wafer component definitions
 *
 * @returns {Promise<ServerElement>}
 */
const convert = async (el, registry = {}) => {
  /**
   * Convert any child nodes of `el` into `ServerElement` instances too
   */
  const children = [];

  for (const node of el.childNodes) {
    children.push(await convert(node, registry));
  }

  /**
   * Swap current children with their `ServerElement` counterparts
   */
  el.childNodes = children;

  /**
   * Lower case tag name of the element
   */
  const tagName = el.tagName && el.tagName.toLowerCase();

  /**
   * The new ServerElement
   */
  let newEl;

  if (Object.keys(registry).includes(tagName)) {
    /**
     * If this element has a tag name of a Wafer component, create Wafer instance
     */
    newEl = new registry[tagName].def({ tagName }, registry);

    /**
     * Set as underlying element
     */
    newEl.setElement(el);

    /**
     * Await construction
     */
    await newEl.construct();

    /**
     * Take attributes of element and copy them over to new ServerElement
     */
    for (const [attribute, value] of Object.entries(el.attributes)) {
      newEl.setAttribute(attribute, value);
    }

    /**
     * Simulate connection to the 'DOM'
     */
    await newEl.connectedCallback();
  } else {
    /**
     * Not a Wafer component, so just creating a ServerElement requires no
     * special setup
     */
    newEl = new ServerElement(tagName);
    newEl.setElement(el);
  }

  return newEl;
};

/**
 * Render an HTML string as a tree of `ServerElement`s
 *
 * @param {string} htmlString - string to parse
 * @param {import("../types").Registry} registry - registry of tag names to Wafer component definitions
 *
 * @returns {Promise<ServerElement>}
 */
const waferParse = async (htmlString, registry = {}) => {
  /**
   * Parse string into a tree of `HTMLElement`s
   */
  const tree = /** @type {ServerElement} **/ (
    /** @type {unknown} **/ (parse(htmlString))
  );

  /**
   * Convert `HTMLElement` tree into a `ServerElement` tree
   */
  return convert(tree, registry);
};

export { ServerElement, waferParse as parse };
