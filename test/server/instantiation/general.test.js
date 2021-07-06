import { expect } from "../../testing.js";
import sinon from "sinon";

import { WaferServer as Wafer } from "../../../src/server/wafer.js";

describe("WaferServer behaviour on instantiation", () => {
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

    /**
     * @type {Test0}
     */
    const el = new Test0({ tagName: "wafer-test-0" });
    await el.construct();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";

    await el.updateDone();

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

    expect(el.toString()).html.to.equal(
      `
      <wafer-test-0 test="bar">
        <template shadowroot="open"></template>
      </wafer-test-0>
    `
    );
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

    /**
     * @type {Test1}
     */
    const el = new Test1({ tagName: "wafer-test-1" });
    await el.construct();
    await el.connectedCallback();

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

    /**
     * @type {Test2}
     */
    const el = new Test2({ tagName: "wafer-test-2" });
    await el.construct();
    await el.connectedCallback();

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

  it(`should reflect un-reflected property to attribute (server always reflect attributes as they are the source of truth in ssr)`, async () => {
    class Test3 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }

    /**
     * @type {Test3}
     */
    const el = new Test3({ tagName: "wafer-test-3" });
    await el.construct();
    await el.connectedCallback();

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

    expect(el).attr("test").to.equal("bar");
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

    /**
     * @type {Test4}
     */
    const el = new Test4({ tagName: "wafer-test-4" });
    await el.construct();
    await el.connectedCallback();

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

    /**
     * @type {Test5}
     */
    const el = new Test5({ tagName: "wafer-test-5" });
    await el.construct();

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
    const el = new Test6({ tagName: "wafer-test-6" });
    el.test = "bar";

    await el.construct();
    await el.connectedCallback();

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

    /**
     * @type {Test7}
     */
    const el = new Test7({ tagName: "wafer-test-7" });
    await el.construct();
    await el.connectedCallback();

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

    /**
     * @type {Test8}
     */
    const el = new Test8({ tagName: "wafer-test-8" });
    await el.construct();
    await el.connectedCallback();

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

    /**
     * @type {Test9}
     */
    const el = new Test9({ tagName: "wafer-test-9" });
    await el.construct();
    await el.connectedCallback();

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

    /**
     * @type {Test10}
     */
    const el = new Test10({ tagName: "wafer-test-10" });
    await el.construct();
    await el.connectedCallback();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    expect(el).attr("test").to.equal("foo");

    el.test = null;

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(null);
    expect(el.getAttribute("test")).to.equal(undefined);
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

    /**
     * @type {Test11}
     */
    const el = new Test11({ tagName: "wafer-test-11" });
    await el.construct();
    await el.connectedCallback();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    expect(el.getAttribute("test")).to.equal("");

    el.test = null;

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(null);
    expect(el.getAttribute("test")).to.equal(undefined);
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

    /**
     * @type {Test12}
     */
    const el = new Test12({ tagName: "wafer-test-12" });
    await el.construct();
    await el.connectedCallback();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    expect(el.getAttribute("test")).to.equal("");

    el.test = false;

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyUpdated).to.have.callCount(1);

    expect(el.test).to.equal(false);
    expect(el.getAttribute("test")).to.equal(undefined);
  });

  it("should use initial value set before connected", async () => {
    class Test13 extends Wafer {
      static props = {
        test: {
          type: String,
          initial: "foo",
        },
      };
    }

    /**
     * @type {Test13}
     */
    const el = new Test13({ tagName: "wafer-test-13" });
    await el.construct();

    el.test = "bar";

    await el.connectedCallback();

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.equal("bar");
  });

  it("should set boolean prop to false on attribute removal", async () => {
    class Test extends Wafer {
      static props = {
        test: {
          type: Boolean,
          initial: true,
          reflect: true,
        },
      };
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test" });
    await el.construct();
    await el.connectedCallback();

    expect(el.getAttribute("test")).to.equal("");
    expect(el.test).to.equal(true);

    el.removeAttribute("test");
    await el.updateDone();

    expect(el.getAttribute("test")).to.equal(undefined);
    expect(el.test).to.equal(false);
  });
});
