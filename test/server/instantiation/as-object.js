import { expect } from "../../testing.js";
import sinon from "sinon";

import { WaferServer as Wafer } from "../../../src/server/wafer.js";
import configs from "../../configs.js";

describe("Wafer sets attributes and properties on element when defined as object", () => {
  for (const [configIndex, config] of configs.entries()) {
    class Test extends Wafer {
      static props = config.props;
    }

    const attrName = config.props.test.attributeName || "test";

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
          /**
           * @type {Test}
           */
          const el = new Test(
            {
              tagName: `wafer-test-${configIndex}-${testIndex}`,
              attrs: test.attrs,
            },
            {
              [`wafer-test-${configIndex}-${testIndex}`]: { def: Test },
            }
          );
          await el.construct();
          await el.connectedCallback();

          // ssr elements will always have attributes set if prop has a value
          if (test.expected.prop !== undefined) {
            const attrValue =
              config.props.test.type === Boolean
                ? test.expected.prop
                  ? ""
                  : undefined
                : config.props.test.type === Object ||
                  config.props.test.type === Array
                ? JSON.stringify(test.expected.prop)
                : `${test.expected.prop}`;

            expect(el.getAttribute(attrName)).to.equal(attrValue);
          } else {
            expect(el.getAttribute(attrName)).to.equal(undefined);
          }

          expect(el.test).to.deep.equal(test.expected.prop);
        }
      );
    }
  }
});
