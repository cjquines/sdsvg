import { expect, expectTypeOf, test } from "vitest";
import { DancerResolved, resolveDancer } from "./dancer";

test("resolveDancer", () => {
  expectTypeOf(
    resolveDancer({
      x: 0,
      y: 0,
    }),
  ).toMatchTypeOf<DancerResolved>();

  expect(
    resolveDancer({
      x: 0,
      y: 0,
    }),
  ).toMatchInlineSnapshot(
    {
      direction: [],
      label: "",
      phantom: false,
      rotate: 0,
      x: 0,
      y: 0,
    },
    `
    {
      "direction": [],
      "label": "",
      "phantom": false,
      "rotate": 0,
      "x": 0,
      "y": 0,
    }
  `,
  );
});
