import { expect } from "../../testing.js";
import sinon from "sinon";

import Wafer from "../../../src/server/wafer.js";
import { parse } from "../../../src/server/element.js";
import configs from "../../configs.js";

describe("Wafer sets attributes and properties on element when defined as string", () => {
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

          const html = await parse(test.html(`${configIndex}-${testIndex}`), {
            [`wafer-test-${configIndex}-${testIndex}`]: { def: Test },
          });

          const el = html.querySelector(
            `wafer-test-${configIndex}-${testIndex}`
          );

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
