import { fixture, expect } from "@open-wc/testing";
import sinon, { assert } from "sinon";

import { Wafer } from "../../src/wafer.js";

describe("Wafer renders expected content", () => {
  it("renders in shadow DOM", async () => {
    class Test0 extends Wafer {
      static template = "<h1>Test</h1>";
    }
    customElements.define("wafer-test-0", Test0);

    /**
     * @type {Test0}
     */
    const el = await fixture("<wafer-test-0></wafer-test-0>");

    expect(el).dom.to.equal("<wafer-test-0></wafer-test-0>");
    expect(el).shadowDom.to.equal("<h1>Test</h1>");
    expect(el).lightDom.to.equal("");
  });

  it("renders in light DOM", async () => {
    class Test1 extends Wafer {
      static template = "<h1>Test</h1>";

      constructor() {
        super({ shadow: false });
      }
    }
    customElements.define("wafer-test-1", Test1);

    /**
     * @type {Test1}
     */
    const el = await fixture("<wafer-test-1></wafer-test-1>");

    expect(el).dom.to.equal("<wafer-test-1><h1>Test</h1></wafer-test-1>");
    expect(el.shadowRoot).to.be.null;
    expect(el).lightDom.to.equal("<h1>Test</h1>");
  });

  it("renders slots", async () => {
    class Test2 extends Wafer {
      static template = "<h1>Hi <slot></slot></h1>";
    }
    customElements.define("wafer-test-2", Test2);

    /**
     * @type {Test2}
     */
    const el = await fixture("<wafer-test-2><span>Chris</span></wafer-test-2>");

    expect(el).dom.to.equal("<wafer-test-2><span>Chris</span></wafer-test-2>");
    expect(el).shadowDom.to.equal("<h1>Hi <slot></slot></h1>");
    expect(el).lightDom.to.equal("<span>Chris</span>");
  });

  it("updates DOM text in shadow DOM", async () => {
    class Test3 extends Wafer {
      static template = '<h1>Hi <span id="name"></span></h1>';
      static props = {
        name: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "$#name",
              text: true,
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-3", Test3);

    /**
     * @type {Test3}
     */
    const el = await fixture('<wafer-test-3 name="Chris"></wafer-test-3>');

    expect(el).dom.to.equal('<wafer-test-3 name="Chris"></wafer-test-3>');
    expect(el).shadowDom.to.equal('<h1>Hi <span id="name">Chris</span></h1>');
    expect(el).lightDom.to.equal("");
  });

  it("updates DOM text in light DOM", async () => {
    class Test4 extends Wafer {
      static template = "";
      static props = {
        name: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "#name",
              text: true,
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-4", Test4);

    /**
     * @type {Test4}
     */
    const el = await fixture(
      '<wafer-test-4 name="Chris"><span id="name"></span></wafer-test-4>'
    );

    expect(el).dom.to.equal(
      '<wafer-test-4 name="Chris"><span id="name">Chris</span></wafer-test-4>'
    );
    expect(el).shadowDom.to.equal("");
    expect(el).lightDom.to.equal('<span id="name">Chris</span>');
  });

  it("updates DOM property in shadow DOM", async () => {
    class Test5 extends Wafer {
      static template = '<input type="checkbox">';
      static props = {
        on: {
          type: Boolean,
          reflect: true,
          targets: [
            {
              selector: "$input",
              property: "checked",
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-5", Test5);

    /**
     * @type {Test5}
     */
    const el = await fixture("<wafer-test-5 on></wafer-test-5>");

    expect(el).dom.to.equal("<wafer-test-5 on></wafer-test-5>");
    expect(el).shadowDom.to.equal('<input type="checkbox">');
    expect(el).lightDom.to.equal("");

    expect(el.shadowRoot.querySelector("input")).property("checked").to.be.true;
  });

  it("updates DOM property in light DOM", async () => {
    class Test6 extends Wafer {
      static template = '<input type="checkbox">';
      static props = {
        on: {
          type: Boolean,
          reflect: true,
          targets: [
            {
              selector: "input",
              property: "checked",
            },
          ],
        },
      };

      constructor() {
        super({ shadow: false });
      }
    }
    customElements.define("wafer-test-6", Test6);

    /**
     * @type {Test6}
     */
    const el = await fixture("<wafer-test-6 on></wafer-test-6>");

    expect(el).dom.to.equal(
      '<wafer-test-6 on><input type="checkbox"></wafer-test-6>'
    );
    expect(el.shadowRoot).to.be.null;
    expect(el).lightDom.to.equal('<input type="checkbox">');

    expect(el.querySelector("input")).property("checked").to.be.true;
  });

  it("updates DOM attribute in shadow DOM", async () => {
    class Test7 extends Wafer {
      static template = '<input type="checkbox">';
      static props = {
        on: {
          type: Boolean,
          reflect: true,
          targets: [
            {
              selector: "$input",
              attribute: "checked",
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-7", Test7);

    /**
     * @type {Test7}
     */
    const el = await fixture("<wafer-test-7 on></wafer-test-7>");

    expect(el).dom.to.equal("<wafer-test-7 on></wafer-test-7>");
    expect(el).shadowDom.to.equal('<input type="checkbox" checked>');
    expect(el).lightDom.to.equal("");

    expect(el.shadowRoot.querySelector("input"))
      .attribute("checked")
      .to.equal("");
  });

  it("updates DOM property in light DOM", async () => {
    class Test8 extends Wafer {
      static template = '<input type="checkbox">';
      static props = {
        on: {
          type: Boolean,
          reflect: true,
          targets: [
            {
              selector: "input",
              attribute: "checked",
            },
          ],
        },
      };

      constructor() {
        super({ shadow: false });
      }
    }
    customElements.define("wafer-test-8", Test8);

    /**
     * @type {Test8}
     */
    const el = await fixture("<wafer-test-8 on></wafer-test-8>");

    expect(el).dom.to.equal(
      '<wafer-test-8 on><input type="checkbox" checked></wafer-test-8>'
    );
    expect(el.shadowRoot).to.be.null;
    expect(el).lightDom.to.equal('<input type="checkbox" checked>');

    expect(el.querySelector("input")).attribute("checked").to.equal("");
  });

  it("uses custom value in shadow DOM", async () => {
    class Test9 extends Wafer {
      static template = "<div>test</div>";
      static props = {
        test: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "$div",
              use: (value) => `bar ${value}`,
              attribute: "class",
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-9", Test9);

    /**
     * @type {Test9}
     */
    const el = await fixture('<wafer-test-9 test="foo"></wafer-test-9>');

    expect(el).dom.to.equal('<wafer-test-9 test="foo"></wafer-test-9>');
    expect(el).shadowDom.to.equal('<div class="bar foo">test</div>');
    expect(el).lightDom.to.equal("");

    expect(el.shadowRoot.querySelector("div")).has.class("foo");
    expect(el.shadowRoot.querySelector("div")).has.class("bar");
  });

  it("uses custom value in light DOM", async () => {
    class Test10 extends Wafer {
      static template = "<div>test</div>";
      static props = {
        test: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "div",
              use: (value) => `bar ${value}`,
              attribute: "class",
            },
          ],
        },
      };

      constructor() {
        super({ shadow: false });
      }
    }
    customElements.define("wafer-test-10", Test10);

    /**
     * @type {Test10}
     */
    const el = await fixture('<wafer-test-10 test="foo"></wafer-test-10>');

    expect(el).dom.to.equal(
      '<wafer-test-10 test="foo"><div class="bar foo">test</div></wafer-test-9>'
    );
    expect(el.shadowRoot).to.be.null;
    expect(el).lightDom.to.equal('<div class="bar foo">test</div>');

    expect(el.querySelector("div")).has.class("foo");
    expect(el.querySelector("div")).has.class("bar");
  });

  it("updates DOM in shadow DOM", async () => {
    class Test11 extends Wafer {
      static template = "<div>test</div>";
      static props = {
        test: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "$div",
              dom: (el, value) => {
                const child = document.createElement("h1");
                child.textContent = value;
                el.replaceChildren(child);
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-11", Test11);

    /**
     * @type {Test11}
     */
    const el = await fixture('<wafer-test-11 test="foo"></wafer-test-11>');

    expect(el).dom.to.equal('<wafer-test-11 test="foo"></wafer-test-11>');
    expect(el).shadowDom.to.equal("<div><h1>foo</h1></div>");
    expect(el).lightDom.to.equal("");
  });

  it("updates DOM in light DOM", async () => {
    class Test12 extends Wafer {
      static template = "<div>test</div>";
      static props = {
        test: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "div",
              dom: (el, value) => {
                const child = document.createElement("h1");
                child.textContent = value;
                el.replaceChildren(child);
              },
            },
          ],
        },
      };

      constructor() {
        super({ shadow: false });
      }
    }
    customElements.define("wafer-test-12", Test12);

    /**
     * @type {Test12}
     */
    const el = await fixture('<wafer-test-12 test="foo"></wafer-test-12>');

    expect(el).dom.to.equal(
      '<wafer-test-12 test="foo"><div><h1>foo</h1></div></wafer-test-12>'
    );
    expect(el.shadowRoot).to.be.null;
    expect(el).lightDom.to.equal("<div><h1>foo</h1></div");
  });

  it("can use a function for selector", async () => {
    class Test13 extends Wafer {
      static template = `
        <div id="item-1">1</div>
        <div id="item-2">2</div>
        <div id="item-3">3</div>
      `;
      static props = {
        active: {
          type: Number,
          reflect: true,
          targets: [
            {
              selector: (value) => `$#item-${value}`,
              attribute: "active",
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-13", Test13);

    /**
     * @type {Test13}
     */
    const el = await fixture('<wafer-test-13 active="3"></wafer-test-13>');

    expect(el).dom.to.equal('<wafer-test-13 active="3"></wafer-test-13>');
    expect(el).shadowDom.to.equal(`
        <div id="item-1">1</div>
        <div id="item-2">2</div>
        <div id="item-3" active="3">3</div>
      `);
    expect(el).lightDom.to.equal("");
  });

  it("can use self as selector", async () => {
    class Test14 extends Wafer {
      static props = {
        active: {
          type: Number,
          reflect: true,
          targets: [
            {
              selector: "self",
              attribute: "test",
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-14", Test14);

    /**
     * @type {Test14}
     */
    const el = await fixture('<wafer-test-14 active="3"></wafer-test-14>');

    expect(el).attr("test").to.equal("3");
  });

  it("will remove attribute if selecting attribute with null", async () => {
    class Test15 extends Wafer {
      static template = '<div test="blah"></div>';
      static props = {
        active: {
          type: Number,
          reflect: true,
          targets: [
            {
              selector: "$div",
              attribute: "test",
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-15", Test15);

    /**
     * @type {Test15}
     */
    const el = await fixture('<wafer-test-15 active="3"></wafer-test-15>');
    const div = el.shadowRoot.querySelector("div");

    expect(div).attr("test").to.equal("3");

    el.active = null;
    await el.updateDone();

    expect(div).not.to.have.attr("test");
  });

  it("will update elements outside component", async () => {
    class Test16 extends Wafer {
      static props = {
        title: {
          type: String,
          targets: [
            {
              selector: "@title",
              text: true,
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-16", Test16);

    /**
     * @type {Test16}
     */
    const el = await fixture("<wafer-test-16></wafer-test-16>");

    const titleEl = document.createElement("title");
    document.querySelector("head").append(titleEl);

    el.title = "Hi!!";

    await el.updateDone();

    expect(titleEl).to.have.text("Hi!!");
  });

  it("will attach shadow root in browsers without DSD support when server rendered", async () => {
    class Test17 extends Wafer {
      static props = {
        title: {
          type: String,
        },
      };

      // simulate no DSD support
      static get supportsDSD() {
        return false;
      }
    }

    customElements.define("wafer-test-17", Test17);

    /**
     * @type {Test17}
     */
    const el = await fixture(`
      <wafer-test-17 wafer-ssr>
        <template shadowroot="open"></template>
      </wafer-test-17>
    `);
    await el.updateDone();

    const shadowRoot = el.shadowRoot;
    const template = el.querySelector("template[shadowroot]");

    expect(shadowRoot).to.exist;
    expect(template).to.be.null;
  });

  it("will attach shadow root in browsers with DSD support when server rendered", async () => {
    class Test18 extends Wafer {
      static props = {
        title: {
          type: String,
        },
      };
    }
    customElements.define("wafer-test-18", Test18);

    // need to use this to get DSD parsed
    const parsedHTML = new DOMParser()
      .parseFromString(
        `
        <wafer-test-18 wafer-ssr>
          <template shadowroot="open"></template>
        </wafer-test-18>
      `,
        "text/html",
        {
          includeShadowRoots: true,
        }
      )
      .querySelector("wafer-test-18");

    /**
     * @type {Test18}
     */
    const el = await fixture(parsedHTML);
    await el.updateDone();

    const shadowRoot = el.shadowRoot;
    const template = el.querySelector("template[shadowroot]");

    expect(shadowRoot).to.exist;
    expect(template).to.be.null;
  });

  it("will not call updateTargets on initialisation of SSR component (Shadow DOM)", async () => {
    class Test19 extends Wafer {
      static template = "<div></div>";

      static props = {
        test: {
          type: String,
          targets: [
            {
              selector: "$div",
              text: true,
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-19", Test19);

    // need to use this to get DSD parsed
    const parsedHTML = new DOMParser()
      .parseFromString(
        `
        <wafer-test-19 test="foo" wafer-ssr>
          <template shadowroot="open">
            <div>foo</div>
          </template>
        </wafer-test-19>
      `,
        "text/html",
        {
          includeShadowRoots: true,
        }
      )
      .querySelector("wafer-test-19");

    // imports copy into document, so that element is upgraded, but not connected
    // so we can spy on methods that are called when connectedCallback runs
    const node = document.importNode(parsedHTML, true);
    node.attachShadow({ mode: "open" });
    node.shadowRoot.innerHTML = parsedHTML.shadowRoot.innerHTML;

    const spyChanged = sinon.spy(node, "changed");
    const spyUpdated = sinon.spy(node, "updated");
    const spyUpdateTargets = sinon.spy(node, "updateTargets");
    /**
     * @type {Test19}
     */
    const el = await fixture(node);
    await el.updateDone();

    expect(el).dom.to.equal("<wafer-test-19 wafer-ssr></wafer-test-19>");
    expect(el).shadowDom.to.equal("<div>foo</div>");
    expect(el).lightDom.to.equal("");

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);
    expect(spyUpdateTargets).to.have.callCount(0);
  });

  it("will not call updateTargets on initialisation of SSR component (Light DOM)", async () => {
    class Test20 extends Wafer {
      static template = "<div></div>";

      static props = {
        test: {
          type: String,
          targets: [
            {
              selector: "$div",
              text: true,
            },
          ],
        },
      };

      constructor() {
        super({ shadow: false });
      }
    }
    customElements.define("wafer-test-20", Test20);

    // need to use this to get DSD parsed
    const parsedHTML = new DOMParser()
      .parseFromString(
        `
        <wafer-test-20 test="foo" wafer-ssr>
          <div>foo</div>
        </wafer-test-20>
      `,
        "text/html"
      )
      .querySelector("wafer-test-20");

    // imports copy into document, so that element is upgraded, but not connected
    // so we can spy on methods that are called when connectedCallback runs
    const node = document.importNode(parsedHTML, true);

    const spyChanged = sinon.spy(node, "changed");
    const spyUpdated = sinon.spy(node, "updated");
    const spyUpdateTargets = sinon.spy(node, "updateTargets");
    /**
     * @type {Test20}
     */
    const el = await fixture(node);
    await el.updateDone();

    expect(el).dom.to.equal(
      "<wafer-test-20 wafer-ssr><div>foo</div></wafer-test-20>"
    );
    expect(el.shadowRoot).to.be.null;
    expect(el).lightDom.to.equal("<div>foo</div>");

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);
    expect(spyUpdateTargets).to.have.callCount(0);
  });
});
