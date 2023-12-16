import { expect, expectTypeOf, test } from "vitest";

import { makeOptions, Options } from "./options.js";

const defaults = makeOptions({});

test("makeOptions", () => {
  expectTypeOf(defaults).toMatchTypeOf(Options);

  expect(
    makeOptions({
      nose: { size: 2 },
    }).nose.size
  ).toEqual(defaults.nose.size * 2);

  expect(
    makeOptions({
      nose: { distance: 0.5 },
    }).nose.distance
  ).toEqual(defaults.nose.distance + defaults.nose.size * 0.5);

  expect(
    makeOptions({
      space: { horizontal: 0.5 },
    }).space.horizontal
  ).toEqual(defaults.space.horizontal * 0.5);
});

test("makeOptions respects readonly", () => {
  let options = {};
  const result = makeOptions(options);

  expect(result).toEqual(defaults);
  expect(makeOptions(options)).toEqual(defaults);
  expect(result).toEqual(defaults);
  expect(makeOptions(options)).toEqual(defaults);
  expect(result).toEqual(defaults);

  options = {
    space: { horizontal: 0.5 },
  };

  expect(makeOptions(options).space.horizontal).toEqual(
    defaults.space.horizontal * 0.5
  );
  expect(makeOptions(options).space.horizontal).toEqual(
    defaults.space.horizontal * 0.5
  );
});
