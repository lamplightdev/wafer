/**
 * @typedef { import("./wafer-mixin").UseFn } UseFn
 * @typedef { import("./wafer-mixin").DOMUpdateFn } DOMUpdateFn
 */

import { Wafer } from "./wafer.js";
import { repeat } from "./helpers.js";

// define an no-op html function to get syntax highlighting in template strings
const html = String.raw;

class Knobs extends Wafer {
  connectedCallback() {
    super.connectedCallback();

    const root = /** @type {Element} **/ (this.getRootNode());

    const el = root.querySelector(this.for);

    const componentProps = [];
    for (const [name, def] of Object.entries(el.constructor.props)) {
      componentProps.push({
        name,
        ...def,
      });
    }

    this.el = el;
    this.componentProps = componentProps;

    this.updateHTML();
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block;
          font-family: sans-serif;
          margin-top: 1rem;
        }

        :host * {
          box-sizing: border-box;
        }

        h1 {
          position: relative;
          display: flex;
          align-items: center;
          background-color: #555;
          color: white;
          font-size: 0.8rem;
          padding: 0.5rem;
          margin: 0;
        }

        h1 > div {
          margin-right: 1rem;
          flex-grow: 1;
        }

        h1 > div > span {
          font-weight: normal;
          margin-left: 0.5rem;
        }

        h1 details {
          font-weight: normal;
        }

        h1 details > div {
          position: absolute;
          right: 0;
          top: 100%;
          padding: 0 1rem;
          background-color: #555;
          border: 1px solid #bbb;
          border-top: 0;
        }

        h1 summary {
          font-size: 0.6rem;
          list-style-type: none;
          text-transform: uppercase;
          cursor: pointer;
        }

        #panels {
          display: flex;
          width: 100%;
          color: #333;
        }

        .panel {
          width: 50%;
          flex-shrink: 0;
        }

        #props {
          border-right: 1px solid #bbb;
        }

        .title {
          font-size: 0.8rem;
          padding: 0.5rem;
          color: white;
          background-color: #888;
        }

        .knobs > div {
          padding: 0.5rem;
        }

        .knobs > div:not(:last-child) {
          border-bottom: 1px solid #ccc;
        }

        .knobs .input-container {
          margin-top: 0.3rem;
        }

        .knobs label div.propname {
          margin-bottom: 0.3rem;
        }

        .knobs label div.propinfo {
          color: #888;
          font-size: 0.8rem;
          margin-top: 0.3rem;
        }

        input[type="text"],
        input[type="number"],
        textarea {
          width: 100%;
        }

        textarea {
          height: 100px;
        }

        #tag,
        #props-and-attrs {
          border: 1px solid #bbb;
          background-color: #eee;
          padding: 0.5rem;
          margin: 0;
          border-top: 0;
        }

        #props-and-attrs {
          padding: 0;
        }

        #tag summary,
        #props-and-attrs summary {
          font-size: 0.8rem;
        }

        #props-and-attrs summary {
          padding: 0.5rem;
        }

        pre {
          overflow: auto;
        }
      </style>
      <h1>
        <div>KNOBS<span></span></div>
        <details>
          <summary>about</summary>
          <div>
            <p>
              Knobs lets you inspect and edit both the properties and attributes
              of a Wafer component live. The current HTML can also be shown.
            </p>
          </div>
        </details>
      </h1>
      <details id="props-and-attrs">
        <summary>Properties and attributes</summary>
        <div id="panels">
          <div class="panel" id="props">
            <div class="title">Properties</div>
            <div class="knobs"></div>
          </div>
          <div class="panel" id="attrs">
            <div class="title">Attributes</div>
            <div class="knobs"></div>
          </div>
        </div>
      </details>
      <details id="tag">
        <summary>HTML</summary>
        <pre></pre>
      </details>
    `;
  }

  static get props() {
    return {
      for: {
        type: String,
        targets: [
          {
            selector: "$h1 > div > span",
            /**
             *
             * @type {UseFn}
             */
            use: (val) => `[${val}]`,
            text: true,
          },
        ],
      },
      el: {
        type: Object,
      },
      html: {
        type: String,
        targets: [
          {
            selector: "$#tag pre",
            text: true,
          },
        ],
      },
      componentProps: {
        type: Array,
        initial: [],
        targets: [
          {
            selector: "$#props .knobs, #attrs .knobs",
            /**
             * @type {DOMUpdateFn}
             */
            dom: (el, props, self) => {
              const elWafer = /** @type {Wafer}  */ (el);
              const selfWafer = /** @type {Wafer}  */ (self);

              const isProps =
                elWafer.parentElement && elWafer.parentElement.id === "props";

              if (selfWafer._firstUpdate) {
                const updatedFn = selfWafer.el.updated.bind(selfWafer.el);
                /** @type {Wafer}*/ (selfWafer.el).updated = (changed) => {
                  updatedFn(changed);

                  for (const name of changed.keys()) {
                    const input = /** @type {HTMLInputElement} */ (
                      elWafer.querySelector(`#input[data-name=${name}]`)
                    );
                    if (!input) continue;

                    const prop = selfWafer.componentProps.find(
                      (/** @type {{name:string}} **/ info) => info.name === name
                    );

                    if (isProps) {
                      if (prop.type === Boolean) {
                        input.checked = selfWafer.el[name];
                      } else if ([Number, String].includes(prop.type)) {
                        input.value = selfWafer.el[name];
                      } else {
                        input.value = JSON.stringify(
                          selfWafer.el[name],
                          null,
                          2
                        );
                      }
                    } else {
                      if (prop.type === Boolean) {
                        input.checked = selfWafer.el.hasAttribute(name);
                      } else {
                        input.value = selfWafer.el.getAttribute(name);
                      }
                    }
                  }

                  selfWafer.updateHTML();
                };
              }

              repeat({
                container: elWafer,
                items: props,
                html: html`
                  <div>
                    <label>
                      <div class="propname"></div>
                      <div id="input-container"></div>
                      <div class="propinfo"></div>
                    </label>
                  </div>
                `,
                keyFn: (prop) => prop.name,
                targets: [
                  {
                    selector: "$div.propname",
                    text: true,
                    use: (prop) => prop.name,
                  },
                  {
                    selector: "$div.propinfo",
                    text: true,
                    use: (prop) => `
                    ${prop.type.name}, reflect: ${
                      prop.reflect ? "true" : "false"
                    }, initial: ${JSON.stringify(prop.initial)}
                    `,
                  },
                  {
                    selector: "$#input",
                    property: "value",
                    use: (prop) => {
                      if (prop.type !== Boolean) {
                        if (isProps) {
                          if ([Number, String].includes(prop.type)) {
                            return selfWafer.el[prop.name];
                          } else {
                            return JSON.stringify(
                              selfWafer.el[prop.name],
                              null,
                              2
                            );
                          }
                        } else {
                          if (prop.reflect) {
                            return selfWafer.el.getAttribute(prop.name);
                          }
                        }
                      }
                    },
                  },
                  {
                    selector: "$#input",
                    attribute: "checked",
                    use: (prop) => {
                      if (prop.type === Boolean) {
                        if (isProps) {
                          return selfWafer.el[prop.name] ? "" : null;
                        } else {
                          if (prop.reflect) {
                            return selfWafer.el.hasAttribute(prop.name)
                              ? ""
                              : null;
                          }
                        }
                      }
                    },
                  },
                  {
                    selector: "$#input",
                    attribute: "data-name",
                    use: (prop) => prop.name,
                  },
                  {
                    selector: "$#input",
                    attribute: "type",
                    use: (prop) => {
                      switch (prop.type) {
                        case Number:
                          if (isProps) {
                            return "number";
                          }
                          return "text";
                        case Boolean:
                          return "checkbox";
                        case String:
                          return "text";
                        default:
                          return;
                      }
                    },
                  },
                ],
                events: {
                  "#input": {
                    change: (event) => {
                      const input = /** @type {HTMLInputElement} */ (
                        event.target
                      );
                      const name = input.dataset.name || "";
                      const prop = selfWafer.componentProps.find(
                        (/** @type {{name: string}}*/ a) => a.name === name
                      );

                      if (prop) {
                        if (prop.type === Boolean) {
                          if (isProps) {
                            selfWafer.el[name] = input.checked;
                          } else {
                            if (input.checked) {
                              selfWafer.el.setAttribute(name, "");
                            } else {
                              selfWafer.el.removeAttribute(name);
                            }
                          }
                        } else {
                          const value = input.value.trim();

                          if (isProps) {
                            if (prop.type === Number) {
                              selfWafer.el[name] = Number(value);
                            } else if (prop.type === String) {
                              selfWafer.el[name] = value;
                            } else {
                              selfWafer.el[name] = JSON.parse(value);
                            }
                          } else {
                            const value = input.value.trim();
                            selfWafer.el.setAttribute(name, value);
                          }
                        }
                      }
                    },
                  },
                },
                init: (el, prop) => {
                  if ([Boolean, Number, String].includes(prop.type)) {
                    const input = document.createElement("input");
                    input.id = "input";
                    const container = el.querySelector("#input-container");
                    if (container) {
                      container.append(input);
                    }
                  } else {
                    const input = document.createElement("textarea");
                    input.id = "input";
                    const container = el.querySelector("#input-container");
                    if (container) {
                      container.append(input);
                    }
                  }
                },
              });
            },
          },
        ],
      },
    };
  }

  updateHTML() {
    this.html = this.el.outerHTML;
  }
}

customElements.define("wafer-knobs", Knobs);
