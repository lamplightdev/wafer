import { fixture, expect, oneEvent } from "@open-wc/testing";
import sinon from "sinon";

import { Wafer } from "../../src/wafer.js";
import { emit, repeat } from "../../src/helpers.js";

describe("Wafer helpers", () => {
  it("emit fires custom events with defaults", async () => {
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
              emit(this, "test-event");
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

    const listener = oneEvent(el, "test-event");

    button.click();

    const { detail, composed, bubbles } = await listener;

    expect(detail).to.deep.equal({});
    expect(composed).to.be.true;
    expect(bubbles).to.be.true;
  });

  it("emit fires custom events with parameters", async () => {
    class Test1 extends Wafer {
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
              emit(
                this,
                "test-event",
                { foo: "bar" },
                {
                  bubbles: false,
                  composed: false,
                }
              );
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
    const button = el.shadowRoot.querySelector("button");

    const listener = oneEvent(el, "test-event");

    button.click();

    const { detail, composed, bubbles } = await listener;

    expect(detail).to.deep.equal({ foo: "bar" });
    expect(composed).to.be.false;
    expect(bubbles).to.be.false;
  });

  it("can render elements in container with repeat", async () => {
    class Test2 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<span></span>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "self",
                      text: true,
                    },
                  ],
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-2", Test2);

    /**
     * @type {Test2}
     */
    const el = await fixture("<wafer-test-2></wafer-test-2>");

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
      </div>
    `);
  });

  it("can remove elements in container with repeat", async () => {
    class Test3 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<span></span>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "self",
                      text: true,
                    },
                  ],
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-3", Test3);

    /**
     * @type {Test3}
     */
    const el = await fixture("<wafer-test-3></wafer-test-3>");

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
      </div>
    `);

    el.items = [1, 2];

    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
      </div>
    `);
  });

  it("can update elements in container with repeat", async () => {
    class Test4 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<span></span>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "self",
                      text: true,
                    },
                  ],
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-4", Test4);

    /**
     * @type {Test4}
     */
    const el = await fixture("<wafer-test-4></wafer-test-4>");

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
      </div>
    `);

    el.items = [4, 3, 5, 2, 6, 1];

    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="4">4</span>
        <span wafer-key="3">3</span>
        <span wafer-key="5">5</span>
        <span wafer-key="2">2</span>
        <span wafer-key="6">6</span>
        <span wafer-key="1">1</span>
      </div>
    `);

    el.items = [3, 4, 5, 2, 6, 1];

    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="3">3</span>
        <span wafer-key="4">4</span>
        <span wafer-key="5">5</span>
        <span wafer-key="2">2</span>
        <span wafer-key="6">6</span>
        <span wafer-key="1">1</span>
      </div>
    `);
  });

  it("can add new elements in container with repeat", async () => {
    class Test5 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<span></span>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "self",
                      text: true,
                    },
                  ],
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-5", Test5);

    /**
     * @type {Test5}
     */
    const el = await fixture("<wafer-test-5></wafer-test-5>");

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
      </div>
    `);

    el.items = [1, 2, 3, 4];

    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
        <span wafer-key="4">4</span>
      </div>
    `);
  });

  it("can bind events to elements in repeat", async () => {
    class Test6 extends Wafer {
      static template = "<div></div>";
      static props = {
        count: {
          type: Number,
          initial: 0,
        },
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<div><span></span><button>click me</button></div>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "span",
                      text: true,
                    },
                  ],
                  events: {
                    button: {
                      click: () => el.count++,
                    },
                  },
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-6", Test6);

    /**
     * @type {Test6}
     */
    const el = await fixture("<wafer-test-6></wafer-test-6>");

    expect(el).shadowDom.to.equal(`
      <div>
        <div wafer-key="1"><span>1</span><button>click me</button></div>
        <div wafer-key="2"><span>2</span><button>click me</button></div>
        <div wafer-key="3"><span>3</span><button>click me</button></div>
      </div>
    `);

    el.shadowRoot.querySelector("button").click();
    el.shadowRoot.querySelector("button").click();

    await el.updateDone();

    expect(el.count).to.equal(2);
  });

  it("runs init function only when adding element", async () => {
    class Test7 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$:scope>div",
              dom: (targetEl, items, self) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<div><span></span></div>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: ":scope>span",
                      text: true,
                    },
                  ],
                  init: (el, item, index) => {
                    const div = document.createElement("div");
                    div.textContent = `d${item} (${index})`;
                    el.append(div);
                  },
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-7", Test7);

    /**
     * @type {Test7}
     */
    const el = await fixture("<wafer-test-7></wafer-test-7>");

    expect(el).shadowDom.to.equal(`
      <div>
        <div wafer-key="1"><span>1</span><div>d1 (0)</div></div>
        <div wafer-key="2"><span>2</span><div>d2 (1)</div></div>
        <div wafer-key="3"><span>3</span><div>d3 (2)</div></div>
      </div>
    `);

    el.items = [4, 3, 5, 2, 6, 1];
    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <div wafer-key="4"><span>4</span><div>d4 (0)</div></div>
        <div wafer-key="3"><span>3</span><div>d3 (2)</div></div>
        <div wafer-key="5"><span>5</span><div>d5 (2)</div></div>
        <div wafer-key="2"><span>2</span><div>d2 (1)</div></div>
        <div wafer-key="6"><span>6</span><div>d6 (4)</div></div>
        <div wafer-key="1"><span>1</span><div>d1 (0)</div></div>
      </div>
    `);
  });

  it("can re-add elements in container with repeat", async () => {
    class Test8 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<span></span>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "self",
                      text: true,
                    },
                  ],
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-8", Test8);

    /**
     * @type {Test8}
     */
    const el = await fixture("<wafer-test-8></wafer-test-8>");

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
      </div>
    `);

    el.items = [3];

    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="3">3</span>
      </div>
    `);

    el.items = [1, 2, 3];

    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
        <span wafer-key="1">1</span>
        <span wafer-key="2">2</span>
        <span wafer-key="3">3</span>
      </div>
    `);
  });

  it("can re-add elements in container with repeat (random)", async () => {
    const start = [5, 8, 9, 45, 33, 12, 1, 99, 74, 53, 77];
    const middle = start.sort((a, b) => b - a).slice(2, 4);
    const end = [5, 9, 33, 22, 12, 134, 1, 99, 53, 45, 77, 8];

    class Test9 extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: start,
          targets: [
            {
              selector: "$div",
              dom: (targetEl, items, el) => {
                repeat({
                  container: targetEl,
                  items,
                  html: "<span></span>",
                  keyFn: (item) => item,
                  targets: [
                    {
                      selector: "self",
                      text: true,
                    },
                  ],
                });
              },
            },
          ],
        },
      };
    }
    customElements.define("wafer-test-9", Test9);

    /**
     * @type {Test9}
     */
    const el = await fixture("<wafer-test-9></wafer-test-9>");

    expect(el).shadowDom.to.equal(`
      <div>
      ${start
        .map((item) => {
          return `<span wafer-key="${item}">${item}</span>`;
        })
        .join("")}
      </div>
    `);

    el.items = middle;
    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
      ${middle
        .map((item) => {
          return `<span wafer-key="${item}">${item}</span>`;
        })
        .join("")}
      </div>
    `);

    el.items = end;
    await el.updateDone();

    expect(el).shadowDom.to.equal(`
      <div>
      ${end
        .map((item) => {
          return `<span wafer-key="${item}">${item}</span>`;
        })
        .join("")}
      </div>
    `);
  });
});
