import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";

import { Wafer } from "../../../src/wafer.js";

describe("Wafer sets attributes and properties on element when defined before created", () => {
  class Test extends Wafer {
    static props = {
      test: {
        type: String,
        reflect: true,
        initial: "foo",
      },
    };
  }
  customElements.define(`wafer-test`, Test);

  it(`initialises props`, async () => {
    /**
     * @type {Test}
     */
    const el = new Test();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";

    await el.updateDone();
    document.body.appendChild(el);

    expect(spyChanged).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal(undefined);

    expect(spyUpdated).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal(undefined);

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.deep.equal("bar");
  });
});
