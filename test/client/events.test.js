import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";

import { Wafer } from "../../src/wafer.js";

describe("Wafer handles events", () => {
  it("binds events to element by default in Shadow DOM", async () => {
    class Test0 extends Wafer {
      static template = "<button>Click me</button>";
      static props = {
        count: {
          type: Number,
          initial: 0,
        },
      };

      get events() {
        return {
          $button: {
            click: () => {
              this.count++;
            },
          },
        };
      }
    }
    customElements.define("wafer-test-0", Test0);

    /**
     * @type {Test0}
     */
    const el = await fixture("<wafer-test-0></wafer-test-0>");
    const button = el.shadowRoot.querySelector("button");

    expect(el.count).to.equal(0);

    button.click();

    await el.updateDone();

    expect(el.count).to.equal(1);

    button.click();

    await el.updateDone();

    expect(el.count).to.equal(2);
  });

  it("binds events to element by default in light DOM", async () => {
    class Test1 extends Wafer {
      static template = "<button>Click me</button>";
      static props = {
        count: {
          type: Number,
          initial: 0,
        },
      };

      constructor() {
        super({ shadow: false });
      }

      get events() {
        return {
          button: {
            click: () => {
              this.count++;
            },
          },
        };
      }
    }
    customElements.define("wafer-test-1", Test1);

    /**
     * @type {Test1}
     */
    const el = await fixture("<wafer-test-1></wafer-test-1>");
    const button = el.querySelector("button");

    expect(el.count).to.equal(0);

    button.click();

    await el.updateDone();

    expect(el.count).to.equal(1);

    button.click();

    await el.updateDone();

    expect(el.count).to.equal(2);
  });

  it("can pass event options", async () => {
    class Test2 extends Wafer {
      static template = "<button>Click me</button>";
      static props = {
        count: {
          type: Number,
          initial: 0,
        },
      };

      get events() {
        return {
          $button: {
            click: {
              fn: () => {
                this.count++;
              },
              opts: {
                once: true,
              },
            },
          },
        };
      }
    }
    customElements.define("wafer-test-2", Test2);

    /**
     * @type {Test2}
     */
    const el = await fixture("<wafer-test-2></wafer-test-2>");
    const button = el.shadowRoot.querySelector("button");

    expect(el.count).to.equal(0);

    button.click();

    await el.updateDone();

    expect(el.count).to.equal(1);

    button.click();

    await el.updateDone();

    expect(el.count).to.equal(1);
  });
});
