import { expect } from "../testing.js";
import sinon from "sinon";

import { WaferServer as Wafer } from "../../src/server/wafer.js";
import { ServerElement, render } from "../../src/server/element.js";

describe("Wafer renders expected content", () => {
  it("renders in shadow DOM", async () => {
    class Test extends Wafer {
      static template = "<h1>Test</h1>";
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test" });
    await el.construct();
    await el.connectedCallback();

    expect(el.toString()).html.to.equal(
      `<wafer-test wafer-ssr>
        <template shadowroot="open">
          <h1>Test</h1>
        </template>
      </wafer-test>`
    );

    expect(el.shadowRoot.toString()).html.to.equal(`
      <template shadowroot="open">
        <h1>Test</h1>
      </template>
    `);
  });

  it("renders in light DOM", async () => {
    class Test extends Wafer {
      static template = "<h1>Test</h1>";

      constructor({ tagName }) {
        super({ tagName, shadow: false });
      }
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test" });
    await el.construct();
    await el.connectedCallback();

    expect(el.toString()).html.to.equal(`
      <wafer-test wafer-ssr>
        <h1>Test</h1>
      </wafer-test>`);

    expect(el.shadowRoot).to.be.null;
  });

  it("renders slots", async () => {
    class Test extends Wafer {
      static template = "<h1>Hi <slot></slot></h1>";
    }

    const html = await render(
      `
      <wafer-test>
        <span>Chris</span>
      </wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `<wafer-test wafer-ssr>
        <span>Chris</span>
        <template shadowroot="open">
          <h1>Hi <slot></slot></h1>
        </template>
      </wafer-test>`
    );
  });

  it("updates DOM text in shadow DOM", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test name="Chris"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `<wafer-test name="Chris" wafer-ssr>
        <template shadowroot="open">
          <h1>Hi <span id="name">Chris</span></h1>
        </template>
      </wafer-test>`
    );
  });

  it("updates DOM text in light DOM", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test name="Chris">
        <span id="name"></span>
      </wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `<wafer-test name="Chris" wafer-ssr>
        <span id="name">Chris</span>
        <template shadowroot="open">
        </template>
      </wafer-test>`
    );
  });

  it("updates DOM property in shadow DOM", async () => {
    class Test extends Wafer {
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

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test", attrs: { on: "" } });
    await el.construct();
    await el.connectedCallback();

    expect(el.toString()).html.to.equal(
      `<wafer-test on wafer-ssr>
        <template shadowroot="open">
          <input type="checkbox">
        </template>
      </wafer-test>`
    );

    expect(el.shadowRoot.querySelector("input")).property("checked").to.be.true;
  });

  it("updates DOM property in light DOM", async () => {
    class Test extends Wafer {
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

      constructor({ tagName, attrs }) {
        super({ tagName, attrs, shadow: false });
      }
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test", attrs: { on: "" } });
    await el.construct();
    await el.connectedCallback();

    expect(el.toString()).html.to.equal(
      `<wafer-test on wafer-ssr>
        <input type="checkbox">
      </wafer-test>`
    );

    expect(el.querySelector("input")).property("checked").to.be.true;
  });

  it("updates DOM attribute in shadow DOM", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test on></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `<wafer-test on wafer-ssr>
        <template shadowroot="open">
          <input type="checkbox" checked>
        </template>
      </wafer-test>`
    );
  });

  it("updates DOM property in light DOM", async () => {
    class Test extends Wafer {
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

      constructor({ tagName }) {
        super({ tagName, shadow: false });
      }
    }

    const html = await render(
      `
      <wafer-test on></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test on wafer-ssr>
        <input type="checkbox" checked>
      </wafer-test>`
    );
  });

  it("uses custom value in shadow DOM", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test test="foo"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test test="foo" wafer-ssr>
        <template shadowroot="open">
          <div class="bar foo">test</div>
        </template>
      </wafer-test>`
    );
  });

  it("uses custom value in light DOM", async () => {
    class Test extends Wafer {
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

      constructor({ tagName }) {
        super({ tagName, shadow: false });
      }
    }

    const html = await render(
      `
      <wafer-test test="foo"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test test="foo" wafer-ssr>
          <div class="bar foo">test</div>
      </wafer-test>`
    );
  });

  it("updates DOM in shadow DOM", async () => {
    class Test extends Wafer {
      static template = "<div>test</div>";
      static props = {
        test: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "$div",
              dom: (el, value) => {
                const child = new ServerElement("h1");
                child.textContent = value;
                el.innerHTML = "";
                el.appendChild(child._element);
              },
            },
          ],
        },
      };
    }

    const html = await render(
      `
      <wafer-test test="foo"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test test="foo" wafer-ssr>
        <template shadowroot="open">
          <div><h1>foo</h1></div>
        </template>
      </wafer-test>`
    );
  });

  it("updates DOM in light DOM", async () => {
    class Test extends Wafer {
      static template = "<div>test</div>";
      static props = {
        test: {
          type: String,
          reflect: true,
          targets: [
            {
              selector: "div",
              dom: (el, value) => {
                const child = new ServerElement("h1");
                child.textContent = value;
                el.innerHTML = "";
                el.appendChild(child._element);
              },
            },
          ],
        },
      };

      constructor({ tagName }) {
        super({ tagName, shadow: false });
      }
    }

    const html = await render(
      `
      <wafer-test test="foo"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test test="foo" wafer-ssr>
        <div><h1>foo</h1></div>
      </wafer-test>`
    );
  });

  it("can use a function for selector", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test active="3"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test active="3" wafer-ssr>
        <template shadowroot="open">
          <div id="item-1">1</div>
          <div id="item-2">2</div>
          <div id="item-3" active="3">3</div>
        </template>
      </wafer-test>`
    );
  });

  it("can use self as selector", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test active="3"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test active="3" test="3" wafer-ssr>
        <template shadowroot="open"></template>
      </wafer-test>
      `
    );
  });

  it("will remove attribute if selecting attribute with null", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <wafer-test active="3"></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    expect(html.toString()).html.to.equal(
      `
      <wafer-test active="3" wafer-ssr>
        <template shadowroot="open">
          <div test="3"></div>
        </template>
      </wafer-test>
      `
    );

    const el = html.querySelector("wafer-test");
    el.active = null;
    await el.updateDone();

    expect(html.toString()).html.to.equal(
      `
      <wafer-test wafer-ssr>
        <template shadowroot="open">
          <div></div>
        </template>
      </wafer-test>
      `
    );
  });

  it("will update elements outside component", async () => {
    class Test extends Wafer {
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

    const html = await render(
      `
      <title></title>
      <wafer-test></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    const el = html.querySelector("wafer-test");
    const titleEl = html.querySelector("title");

    el.title = "Yo!!";
    await el.updateDone();

    expect(titleEl).to.have.text("Yo!!");
  });

  it("should remove attributes that are not reflected if not being client side rendered (serverOnly)", async () => {
    class Test extends Wafer {
      static props = {
        title: {
          type: String,
          initial: "bar",
        },
      };
    }

    const html = await render(
      `
      <wafer-test title="foo"></wafer-test>
      `,
      { "wafer-test": { def: Test, serverOnly: true } }
    );

    // title attribute removed since not reflected and not needed for client side hydration
    // also no wafer-ssr attribute present as not needed
    expect(html.toString()).html.to.equal(
      `
      <wafer-test>
        <template shadowroot="open"></template>
      </wafer-test>
      `
    );

    const el = html.querySelector("wafer-test");
    expect(el.title).to.equal("foo");
  });
});
