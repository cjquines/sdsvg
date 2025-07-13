import { expect, expectTypeOf, test } from "vitest";

import {
  defaultOptions as defaults,
  Options,
  resolveOptions,
} from "./options.js";

test("resolveOptions", () => {
  expectTypeOf(defaults).toMatchTypeOf<Options>();

  expect(
    resolveOptions({
      nose: { size: `*2` },
    }).nose.size,
  ).toEqual(defaults.nose.size * 2);

  expect(
    resolveOptions({
      nose: { distance: `*0.5` },
    }).nose.distance,
  ).toEqual(defaults.nose.distance * 0.5);

  expect(
    resolveOptions({
      layout: { horizontalGap: `*0.5` },
    }).layout.horizontalGap,
  ).toEqual(defaults.layout.horizontalGap * 0.5);
});

test("resolveOptions respects readonly", () => {
  let options = Object.freeze({});
  let result = Object.freeze(resolveOptions(options));

  expect(resolveOptions(options)).toEqual(defaults);
  expect(resolveOptions(options)).toEqual(defaults);

  options = Object.freeze({ layout: { horizontalGap: `*0.5` } });
  result = Object.freeze(resolveOptions(options));

  expect(resolveOptions(options).layout.horizontalGap).toEqual(
    defaults.layout.horizontalGap * 0.5,
  );
  expect(resolveOptions(options).layout.horizontalGap).toEqual(
    defaults.layout.horizontalGap * 0.5,
  );
});
