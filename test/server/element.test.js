import { expect } from "../testing.js";

import { ServerElement, render } from "../../src/server/element.js";

describe("Wafer element", () => {
  it("can set content using innerHTML", async () => {
    const el = new ServerElement("div");

    el.innerHTML = `<h1>Hi!!</h1><h2>Bye!!</h2>`;

    const children = el.childNodes;

    expect(children.length).to.equal(2);

    expect(children[0].tagName).to.equal("H1");
    expect(children[0].textContent).to.equal("Hi!!");

    expect(children[1].tagName).to.equal("H2");
    expect(children[1].textContent).to.equal("Bye!!");
  });

  it("can get firstChild", async () => {
    const el = new ServerElement("div");

    el.innerHTML = `<h1>Hi!!</h1><h2>Bye!!</h2>`;

    const firstChild = el.firstChild;

    expect(firstChild.tagName).to.equal("H1");
    expect(firstChild.textContent).to.equal("Hi!!");
  });
});
