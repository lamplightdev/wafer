import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";

import { Wafer } from "../../../src/wafer.js";
import configs from "../../configs.js";

describe("Wafer sets attributes and properties on element when defined after DOM", () => {
  for (const [configIndex, config] of configs.entries()) {
    for (const [testIndex, test] of config.tests.entries()) {
      let itFunc = it;
      if (test.only) {
        itFunc = it.only;
      }

      itFunc(
        `with ${test.html(`${configIndex}-${testIndex}`).trim()} (${
          config.description
        }, ${test.description})`,
        async () => {
          class Test extends Wafer {
            static props = config.props;
          }

          const attrName = config.props.test.attributeName || "test";

          /**
           * @type {Test}
           */
          const el = await fixture(test.html(`${configIndex}-${testIndex}`));
          customElements.define(`wafer-test-${configIndex}-${testIndex}`, Test);

          const spyChanged = sinon.spy(el, "changed");
          const spyUpdated = sinon.spy(el, "updated");

          await customElements.whenDefined(
            `wafer-test-${configIndex}-${testIndex}`
          );

          await el.updateDone();

          expect(spyChanged).to.have.callCount(test.expected.changed.length);
          for (const expected of test.expected.changed) {
            expect(spyChanged).calledWith(expected.value);
            // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
            // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
            expect(spyChanged.args[0][0].size).equal(expected.value.size);

            for (const [key, value] of expected.value) {
              expect(spyChanged.args[0][0].has(key)).equal(true);
              expect(spyChanged.args[0][0].get(key)).equal(value);
            }
          }

          expect(spyUpdated).to.have.callCount(test.expected.updated.length);
          for (const expected of test.expected.updated) {
            // can't check for equal maps, since a key set to undefined is the same as a key that's not set (with chai)
            // expect(spyUpdated).calledWith(new Map([['test', undefined]])) === expect(spyUpdated).calledWith(new Map([['blah', undefined]]))
            expect(spyUpdated.args[0][0].size).equal(expected.value.size);

            for (const [key, value] of expected.value) {
              expect(spyUpdated.args[0][0].has(key)).equal(true);
              expect(spyUpdated.args[0][0].get(key)).equal(value);
            }
          }

          if (test.expected.attribute !== null) {
            expect(el).attr(attrName).to.equal(test.expected.attribute);
          } else {
            expect(el).not.to.have.attr(attrName);
          }
          expect(el.test).to.deep.equal(test.expected.prop);
        }
      );
    }
  }
});
