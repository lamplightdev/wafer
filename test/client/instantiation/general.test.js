import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";

import { Wafer } from "../../../src/wafer.js";

describe("Wafer behaviour on instantiation", () => {
  it(`should update even if not connected`, async () => {
    class Test0 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-0`, Test0);

    /**
     * @type {Test0}
     */
    const el = new Test0();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";

    await el.updateDone();

    expect(el._connected).to.equal(false);

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

  it(`should update reflected property when attribute changes`, async () => {
    class Test1 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-1`, Test1);

    /**
     * @type {Test1}
     */
    const el = await fixture("<wafer-test-1></wafer-test-1>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.setAttribute("test", "bar");

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("foo");

    expect(spyUpdated).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("foo");

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.deep.equal("bar");
  });

  it(`should update un-reflected property when attribute changes`, async () => {
    class Test2 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-2`, Test2);

    /**
     * @type {Test2}
     */
    const el = await fixture("<wafer-test-2></wafer-test-2>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.setAttribute("test", "bar");

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("foo");

    expect(spyUpdated).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("foo");

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.deep.equal("bar");
  });

  it(`should not reflect un-reflected property to attribute`, async () => {
    class Test3 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-3`, Test3);

    /**
     * @type {Test3}
     */
    const el = await fixture("<wafer-test-3></wafer-test-3>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("foo");

    expect(spyUpdated).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("foo");

    expect(el).not.to.have.attr("test");
    expect(el.test).to.deep.equal("bar");
  });

  it(`should not call _setFromAttribute when attribute is set to existing value when connected`, async () => {
    class Test4 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-4`, Test4);

    /**
     * @type {Test4}
     */
    const el = await fixture("<wafer-test-4></wafer-test-4>");

    const spySetFromAttribute = sinon.spy(el, "_setFromAttribute");

    el.setAttribute("test", "bar");
    await el.updateDone();

    expect(spySetFromAttribute).to.have.callCount(1);
    spySetFromAttribute.resetHistory();

    el.setAttribute("test", "bar");
    await el.updateDone();

    expect(spySetFromAttribute).to.have.callCount(0);
  });

  it(`should not call _setFromAttribute when not connected`, async () => {
    class Test5 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-5`, Test5);

    /**
     * @type {Test5}
     */
    const el = new Test5();

    const spySetFromAttribute = sinon.spy(el, "_setFromAttribute");

    el.setAttribute("test", "bar");
    await el.updateDone();

    expect(spySetFromAttribute).to.have.callCount(0);
    spySetFromAttribute.resetHistory();

    el.setAttribute("test", "bar");
    await el.updateDone();

    expect(spySetFromAttribute).to.have.callCount(0);
  });

  it("should use initial value set before upgraded", async () => {
    class Test6 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }

    /**
     * @type {Test6}
     */
    const el = await fixture("<wafer-test-6></wafer-test-6>");
    el.test = "bar";

    customElements.define(`wafer-test-6`, Test6);

    await el.updateDone();

    expect(el._initials.test).equal("bar");

    expect(el.test).to.equal("bar");
  });

  it("should not call changed/updated when prop is changed to a new value then back to the old one", async () => {
    class Test7 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }

    customElements.define(`wafer-test-7`, Test7);

    /**
     * @type {Test7}
     */
    const el = await fixture("<wafer-test-7></wafer-test-7>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";
    el.test = "foo";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(0);
    expect(spyUpdated).to.have.callCount(0);

    expect(el.test).to.equal("foo");
  });

  it("should not call changed/updated when prop is changed to the same value twice", async () => {
    class Test8 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }

    customElements.define(`wafer-test-8`, Test8);

    /**
     * @type {Test8}
     */
    const el = await fixture("<wafer-test-8></wafer-test-8>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";
    el.test = "bar";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal("bar");
  });

  it("should set prop to null if attribute removed", async () => {
    class Test9 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
          reflect: true,
        },
      };
    }

    customElements.define(`wafer-test-9`, Test9);

    /**
     * @type {Test9}
     */
    const el = await fixture("<wafer-test-9></wafer-test-9>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.removeAttribute("test");

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(null);
  });

  it("should remove attribute when non boolean prop set to null", async () => {
    class Test10 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
          reflect: true,
        },
      };
    }

    customElements.define(`wafer-test-10`, Test10);

    /**
     * @type {Test10}
     */
    const el = await fixture("<wafer-test-10></wafer-test-10>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    expect(el).attr("test").to.equal("foo");

    el.test = null;

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(null);
    expect(el).not.to.have.attr("test");
  });

  it("should remove attribute when boolean prop set to null", async () => {
    class Test11 extends Wafer {
      static props = {
        test: {
          type: Boolean,
          initial: true,
          reflect: true,
        },
      };
    }

    customElements.define(`wafer-test-11`, Test11);

    /**
     * @type {Test11}
     */
    const el = await fixture("<wafer-test-11></wafer-test-11>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    expect(el).attr("test").to.equal("");

    el.test = null;

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(null);
    expect(el).not.to.have.attr("test");
  });

  it("should remove attribute when boolean prop set to false", async () => {
    class Test12 extends Wafer {
      static props = {
        test: {
          type: Boolean,
          initial: true,
          reflect: true,
        },
      };
    }

    customElements.define(`wafer-test-12`, Test12);

    /**
     * @type {Test12}
     */
    const el = await fixture("<wafer-test-12></wafer-test-12>");

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    expect(el).attr("test").to.equal("");

    el.test = false;

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(false);
    expect(el).not.to.have.attr("test");
  });
});
