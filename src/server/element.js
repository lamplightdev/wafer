/**
 * Server implementation of {@link Element}
 *
 * @module ServerElement
 */

import pkg from "node-html-parser";
// @ts-ignore
const { parse, HTMLElement } = pkg;

class ServerElement {
  /**
   *
   * @param {string} tagName
   * @param {Object<string,string>} attrs
   */
  constructor(tagName, attrs = {}) {
    if (tagName) {
      this._element = new HTMLElement(tagName, {});
      this._element.setAttributes(attrs);
    }
  }

  /**
   *
   * @param {HTMLElement} element
   */
  setElement(element) {
    this._element = element;
  }

  getElement() {
    return this._element;
  }

  /**
   *
   * @param {string} key
   * @returns
   */
  hasAttribute(key) {
    return this._element.hasAttribute(key);
  }

  /**
   *
   * @param {string} key
   * @returns
   */
  getAttribute(key) {
    return this._element.getAttribute(key);
  }

  /**
   *
   * @param {string} key
   * @param {string} value
   * @returns
   */
  setAttribute(key, value) {
    return this._element.setAttribute(key, value);
  }

  /**
   *
   * @param {string} key
   */
  removeAttribute(key) {
    this._element.removeAttribute(key);
  }

  /**
   *
   * @param {ServerElement} el
   * @returns
   */
  appendChild(el) {
    return this._element.appendChild(el.getElement());
  }

  /**
   *
   * @param {string} selector
   * @returns
   */
  querySelector(selector) {
    return this._element.querySelector(selector);
  }

  /**
   *
   * @param {string} selector
   * @returns
   */
  querySelectorAll(selector) {
    return this._element.querySelectorAll(selector);
  }

  get tagName() {
    return this._element.tagName;
  }

  get attributes() {
    return this._element.attributes;
  }

  get firstChild() {
    return this._element.firstChild;
  }

  get childNodes() {
    return this._element.childNodes;
  }

  get parentNode() {
    return this._element.parentNode;
  }

  get nodeType() {
    return this._element.nodeType;
  }

  get rawTagName() {
    return this._element.rawTagName;
  }

  /**
   * @param {string} content
   */
  set textContent(content) {
    this._element.textContent = content;
  }

  get textContent() {
    return this._element.textContent;
  }

  /**
   * @param {string} html
   */
  set innerHTML(html) {
    this._element.innerHTML = html;
  }

  toString() {
    return this._element.toString();
  }
}

/**
 *
 * @param {typeof HTMLElement} el
 * @param {Object<string, { serverOnly?: boolean, def: new (...args: any[]) => import("./wafer").WaferServer}>} registry
 * @returns {Promise<ServerElement>}
 */
const convert = async (el, registry = {}) => {
  const children = [];
  for (const node of el.childNodes) {
    children.push(await convert(node, registry));
  }

  el.childNodes = children;

  let newEl;
  /**
   * @type {string}
   */
  const tagName = el.tagName && el.tagName.toLowerCase();
  if (Object.keys(registry).includes(tagName)) {
    newEl = new registry[tagName].def({ tagName }, registry);
    newEl.setElement(el);
    await newEl.construct();
    for (const [attribute, value] of Object.entries(el.attributes)) {
      newEl.setAttribute(attribute, value);
    }
    await newEl.connectedCallback();
  } else {
    newEl = new ServerElement(tagName);
    newEl.setElement(el);
  }

  return newEl;
};

/**
 *
 * @param {string} data
 * @param {Object<string, {serverOnly?: boolean, def: new (...args: any[]) => import("./wafer").WaferServer}>} registry
 * @returns {Promise<ServerElement>}
 */
const render = async (data, registry = {}) => {
  const tree = parse(data);
  return convert(tree, registry);
};

export { ServerElement, convert, render };
