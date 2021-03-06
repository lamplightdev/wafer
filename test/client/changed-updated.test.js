import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";

import Wafer from "../../src/wafer.js";

describe("Wafer update/changed calls", () => {
  it(`should call changed once, updated once when one prop changes (not connected to DOM)`, async () => {
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-0`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();

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
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-1`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);
    await el.updateDone();

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
    class Test extends Wafer {
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
    customElements.define(`wafer-test-2`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);
    await el.updateDone();

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
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };
    }
    customElements.define(`wafer-test-3`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);
    await el.updateDone();

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

  it(`should call changed/updated twice if prop changes in updated`, async () => {
    class Test extends Wafer {
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
    customElements.define(`wafer-test-4`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);
    await el.updateDone();

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
    class Test extends Wafer {
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
    customElements.define(`wafer-test-5`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);
    await el.updateDone();

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
    class Test extends Wafer {
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
    customElements.define(`wafer-test-6`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);
    await el.updateDone();

    const spyChanged = sinon.spy(el, "changed");
    const spyUpdated = sinon.spy(el, "updated");
    const spyUpdateTargets = sinon.spy(el, "updateTargets");

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

    expect(spyUpdateTargets).to.have.callCount(2);
    expect(spyUpdateTargets.args[0][0]).equal("test");
    expect(spyUpdateTargets.args[1][0]).equal("test2");

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
    customElements.define(`wafer-test-7`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);

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
    customElements.define(`wafer-test-8`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);

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
    customElements.define(`wafer-test-9`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();
    document.body.append(el);

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

  it(`updateDone should wait if updated returns promise that updates a property in updated`, async () => {
    class Test extends Wafer {
      static props = {
        test: {
          type: String,
          reflect: true,
          initial: "foo",
        },
      };

      updated(changed) {
        if (changed.has("test") && this.test === "bar") {
          return new Promise((resolve) => {
            setTimeout(() => {
              this.test = "baz";
              resolve();
            }, 100);
          });
        }
      }
    }
    customElements.define(`wafer-test-10`, Test);

    /**
     * @type {Test}
     */
    const el = new Test();

    document.body.append(el);
    await el.updateDone();

    const spyUpdate = sinon.spy(el, "update");

    el.test = "bar";

    await el.updateDone();

    expect(spyUpdate).to.have.callCount(2);
    expect(el.test).to.equal("baz");
  });
});
