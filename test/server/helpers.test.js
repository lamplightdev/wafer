import { expect } from "../testing.js";
import sinon from "sinon";

import Wafer from "../../src/server/wafer.js";
import { repeat } from "../../src/server/dom.js";
import { ServerElement, parse } from "../../src/server/element.js";

describe("Wafer DOM", () => {
  it("can render elements in container with repeat", async () => {
    class Test extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: async (targetEl, items, el) => {
                await repeat({
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
                  registry: el._registry,
                });
              },
            },
          ],
        },
      };
    }

    const html = await parse(
      `
      <wafer-test></wafer-test>
      `,
      { "wafer-test": { def: Test, serverOnly: false } }
    );

    expect(html.toString()).html.to.equal(
      `<wafer-test items="[1,2,3]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="1">1</span>
            <span wafer-key="2">2</span>
            <span wafer-key="3">3</span>
          </div>
        </template>
      </wafer-test>`
    );
  });

  it("can remove elements in container with repeat", async () => {
    class Test extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: async (targetEl, items, el) => {
                await repeat({
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

    const html = await parse(
      `
      <wafer-test></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    const el = html.querySelector("wafer-test");

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[1,2,3]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="1">1</span>
            <span wafer-key="2">2</span>
            <span wafer-key="3">3</span>
          </div>
        </template>
      </wafer-test>`
    );

    el.items = [1, 2];

    await el.updateDone();

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[1,2]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="1">1</span>
            <span wafer-key="2">2</span>
          </div>
        </template>
      </wafer-test>`
    );
  });

  it("can update elements in container with repeat", async () => {
    class Test extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: async (targetEl, items, el) => {
                await repeat({
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

    const html = await parse(
      `
      <wafer-test></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    const el = html.querySelector("wafer-test");

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[1,2,3]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="1">1</span>
            <span wafer-key="2">2</span>
            <span wafer-key="3">3</span>
          </div>
        </template>
      </wafer-test>`
    );

    el.items = [4, 3, 5, 2, 6, 1];

    await el.updateDone();

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[4,3,5,2,6,1]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="4">4</span>
            <span wafer-key="3">3</span>
            <span wafer-key="5">5</span>
            <span wafer-key="2">2</span>
            <span wafer-key="6">6</span>
            <span wafer-key="1">1</span>
          </div>
        </template>
      </wafer-test>`
    );
  });

  it("can add new elements in container with repeat", async () => {
    class Test extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$div",
              dom: async (targetEl, items, el) => {
                await repeat({
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

    const html = await parse(
      `
      <wafer-test></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    const el = html.querySelector("wafer-test");

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[1,2,3]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="1">1</span>
            <span wafer-key="2">2</span>
            <span wafer-key="3">3</span>
          </div>
        </template>
      </wafer-test>`
    );

    el.items = [1, 2, 3, 4];

    await el.updateDone();

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[1,2,3,4]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <span wafer-key="1">1</span>
            <span wafer-key="2">2</span>
            <span wafer-key="3">3</span>
            <span wafer-key="4">4</span>
          </div>
        </template>
      </wafer-test>`
    );
  });

  it("runs init function only when adding element", async () => {
    class Test extends Wafer {
      static template = "<div></div>";
      static props = {
        items: {
          type: Array,
          initial: [1, 2, 3],
          targets: [
            {
              selector: "$:scope>div",
              dom: async (targetEl, items, self) => {
                await repeat({
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
                  init: async (el, item, index) => {
                    const div = new ServerElement("div");
                    div.textContent = `d${item} (${index})`;
                    el.appendChild(div);
                  },
                });
              },
            },
          ],
        },
      };
    }

    const html = await parse(
      `
      <wafer-test></wafer-test>
      `,
      { "wafer-test": { def: Test } }
    );

    const el = html.querySelector("wafer-test");

    expect(el.toString()).html.to.equal(
      `<wafer-test items="[1,2,3]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <div wafer-key="1"><span>1</span><div>d1 (0)</div></div>
            <div wafer-key="2"><span>2</span><div>d2 (1)</div></div>
            <div wafer-key="3"><span>3</span><div>d3 (2)</div></div>
          </div>
        </template>
      </wafer-test>`
    );

    el.items = [4, 3, 5, 2, 6, 1];
    await el.updateDone();

    expect(el.toString()).html.to.equal(`
      <wafer-test items="[4,3,5,2,6,1]" wafer-ssr>
        <template shadowroot="open">
          <div>
            <div wafer-key="4"><span>4</span><div>d4 (0)</div></div>
            <div wafer-key="3"><span>3</span><div>d3 (1)</div></div>
            <div wafer-key="5"><span>5</span><div>d5 (2)</div></div>
            <div wafer-key="2"><span>2</span><div>d2 (3)</div></div>
            <div wafer-key="6"><span>6</span><div>d6 (4)</div></div>
            <div wafer-key="1"><span>1</span><div>d1 (5)</div></div>
          </div>
        </template>
      </wafer-test>
    `);
  });
});
