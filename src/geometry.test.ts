import { expect, test } from "vitest";

import { Geometry, geometrize } from "./geometry";
import { Dancer } from "./dancer";

test("rotate", () => {
  expect(
    geometrize({ x: 0, y: 0 } as Dancer, Geometry.Hexagon, { x: 0, y: 1 })
  ).toEqual([
    { rotate: 0, x: 0, y: 0 },
    {
      rotate: expect.closeTo(120),
      x: expect.closeTo(Math.sqrt(3) / 2),
      y: expect.closeTo(1.5),
    },
    {
      rotate: expect.closeTo(240),
      x: expect.closeTo(-Math.sqrt(3) / 2),
      y: expect.closeTo(1.5),
    },
  ]);
});
