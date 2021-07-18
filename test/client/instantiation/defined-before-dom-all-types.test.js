import { fixture, expect } from "@open-wc/testing";
import sinon from "sinon";

import Wafer from "../../../src/wafer.js";
import configs from "../../configs.js";

describe("Wafer sets attributes and properties on element when defined before DOM", () => {
  for (const [index, config] of configs.entries()) {
    class Test extends Wafer {
      static props = config.props;
    }
    customElements.define(`wafer-test-${index}`, Test);

    const attrName = config.props.test.attributeName || "test";

    for (const test of config.tests) {
      let itFunc = it;
      if (test.only) {
        itFunc = it.only;
      }

      itFunc(
        `with ${test.html(index).trim()} (${config.description}, ${
          test.description
        })`,
        async () => {
          /**
           * @type {Test}
           */
          const el = await fixture(test.html(index));

          // can't spy on changed/updated as they will have already been
          // called before we can spy on them

          await el.updateDone();

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
