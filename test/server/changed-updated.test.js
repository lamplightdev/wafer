import { expect } from "../testing.js";
import sinon from "sinon";

import { WaferServer as Wafer } from "../../src/server/wafer.js";

describe("Wafer update/changed calls", () => {
  it(`should call changed once, updated once when one prop changes (not connected to DOM)`, async () => {
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

    expect(el._connectedOnce).to.equal(false);

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

  it(`should call changed once, updated once when prop changes twice in same tick`, async () => {
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

    el.test = "baz";
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

  it(`should call changed twice, updated once when prop changes in response to changed prop`, async () => {
    class Test2 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };

      changed(changed) {
        if (changed.has("test") && this.test === "baz") {
          this.test = "bar";
        }
      }
    }

    /**
     * @type {Test2}
     */
    const el = new Test2({ tagName: "wafer-test-2" });
    await el.construct();
    await el.connectedCallback();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "baz";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(2);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("foo");

    expect(spyChanged.args[1][0].size).equal(1);
    expect(spyChanged.args[1][0].has("test")).equal(true);
    expect(spyChanged.args[1][0].get("test")).equal("baz");

    expect(spyUpdated).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("foo");

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.deep.equal("bar");
  });

  it(`should not call changed/updated if prop changes result in original value`, async () => {
    class Test3 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
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

    el.test = "foo";
    el.test = "bar";
    el.test = "baz";
    el.test = "foo";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(0);
    expect(spyUpdated).to.have.callCount(0);

    expect(el).attr("test").to.equal("foo");
    expect(el.test).to.deep.equal("foo");
  });

  it(`should call changed/updated once then changed/updated once again if prop changes in updated`, async () => {
    class Test4 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };

      updated(updated) {
        if (updated.has("test") && this.test === "bar") {
          this.test = "baz";
        }
      }
    }

    /**
     * @type {Test4}
     */
    const el = new Test4({ tagName: "wafer-test-4" });
    await el.construct();
    await el.connectedCallback();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");

    el.test = "bar";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(2);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("foo");

    expect(spyChanged.args[1][0].size).equal(1);
    expect(spyChanged.args[1][0].has("test")).equal(true);
    expect(spyChanged.args[1][0].get("test")).equal("bar");

    expect(spyUpdated).to.have.callCount(2);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("foo");

    expect(spyUpdated.args[1][0].size).equal(1);
    expect(spyUpdated.args[1][0].has("test")).equal(true);
    expect(spyUpdated.args[1][0].get("test")).equal("bar");

    expect(el).attr("test").to.equal("baz");
    expect(el.test).to.deep.equal("baz");
  });

  it(`should not update if prop name returned from changed`, async () => {
    class Test5 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };

      changed(changed) {
        return ["test"];
      }
    }

    /**
     * @type {Test5}
     */
    const el = new Test5({ tagName: "wafer-test-5" });
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

    expect(spyUpdated).to.have.callCount(0);

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.deep.equal("bar");
  });

  it(`should trigger declared triggers on prop change`, async () => {
    class Test6 extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
          triggers: ["test2"],
        },
        test2: {
          type: String,
          initial: "baz",
          reflect: true,
        },
      };
    }

    /**
     * @type {Test6}
     */
    const el = new Test6({ tagName: "wafer-test-6" });
    await el.construct();
    await el.connectedCallback();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");
    const spyUpdateTargers = sinon.spy(el, "updateTargets");

    el.test = "bar";

    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
    // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("foo");

    expect(spyUpdated).to.have.callCount(1);

    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("foo");

    expect(spyUpdateTargers).to.have.callCount(2);
    expect(spyUpdateTargers.args[0][0]).equal("test");
    expect(spyUpdateTargers.args[1][0]).equal("test2");

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.equal("bar");

    expect(el).attr("test2").to.equal("baz");
    expect(el.test2).to.equal("baz");
  });

  it(`should do nothing on requestUpdate(null)`, async () => {
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test" });
    await el.construct();
    await el.connectedCallback();

    el.test = "bar";
    await el.updateDone();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");
    const spyUpdateTargets = sinon.spy(el, "updateTargets");

    await el.requestUpdate(null);

    expect(spyChanged).to.have.callCount(0);
    expect(spyUpdated).to.have.callCount(0);
    expect(spyUpdateTargets).to.have.callCount(0);

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.equal("bar");
  });

  it(`should force update on default requestUpdate`, async () => {
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
        test2: {
          type: String,
          reflect: true,
          initial: "baz",
        },
      };
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test" });
    await el.construct();
    await el.connectedCallback();

    el.test = "bar";
    await el.updateDone();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");
    const spyUpdateTargets = sinon.spy(el, "updateTargets");

    await el.requestUpdate([]);
    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyChanged.args[0][0].size).equal(2);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("bar");
    expect(spyChanged.args[0][0].has("test2")).equal(true);
    expect(spyChanged.args[0][0].get("test2")).equal("baz");

    expect(spyUpdated).to.have.callCount(1);
    expect(spyUpdated.args[0][0].size).equal(2);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("bar");
    expect(spyUpdated.args[0][0].has("test2")).equal(true);
    expect(spyUpdated.args[0][0].get("test2")).equal("baz");

    expect(spyUpdateTargets).to.have.callCount(2);
    expect(spyUpdateTargets.args[0][0]).equal("test");
    expect(spyUpdateTargets.args[1][0]).equal("test2");

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.equal("bar");

    expect(el).attr("test2").to.equal("baz");
    expect(el.test2).to.equal("baz");
  });

  it(`should force update with passed prop only on requestUpdate`, async () => {
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
        test2: {
          type: String,
          reflect: true,
          initial: "baz",
        },
      };
    }

    /**
     * @type {Test}
     */
    const el = new Test({ tagName: "wafer-test" });
    await el.construct();
    await el.connectedCallback();

    el.test = "bar";
    await el.updateDone();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");
    const spyUpdateTargets = sinon.spy(el, "updateTargets");

    await el.requestUpdate(["test"]);
    await el.updateDone();

    expect(spyChanged).to.have.callCount(1);
    expect(spyChanged.args[0][0].size).equal(1);
    expect(spyChanged.args[0][0].has("test")).equal(true);
    expect(spyChanged.args[0][0].get("test")).equal("bar");

    expect(spyUpdated).to.have.callCount(1);
    expect(spyUpdated.args[0][0].size).equal(1);
    expect(spyUpdated.args[0][0].has("test")).equal(true);
    expect(spyUpdated.args[0][0].get("test")).equal("bar");

    expect(spyUpdateTargets).to.have.callCount(1);
    expect(spyUpdateTargets.args[0][0]).equal("test");

    expect(el).attr("test").to.equal("bar");
    expect(el.test).to.equal("bar");

    expect(el).attr("test2").to.equal("baz");
    expect(el.test2).to.equal("baz");
  });
});
