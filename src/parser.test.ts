import { expect, test } from "vitest";

import { getX, parse, parseRow } from "./parser";

test("parseRow", () => {
  expect(parseRow("")).toEqual([]);

  expect(parseRow("nsns")).toEqual([
    { direction: "north" },
    { direction: "south" },
    { direction: "north" },
    { direction: "south" },
  ]);

  expect(parseRow("1> 2> . .")).toEqual([
    { direction: "east", label: "1" },
    { direction: "east", label: "2" },
    { direction: [], shape: "none" },
    { direction: [], shape: "none" },
  ]);

  expect(parseRow("r@ pyx. p3bon dp*")).toEqual([
    { color: "red", direction: [] },
    { color: "yellow", dashed: true, direction: [], label: "x", shape: "none" },
    { color: "blue", dashed: true, direction: "north", label: "o" },
    { dashed: true, direction: [] },
  ]);
});

test("getX", () => {
  expect(getX(0, 1)).toEqual(0);

  expect(getX(0, 2)).toEqual(-0.5);
  expect(getX(1, 2)).toEqual(0.5);

  expect(getX(0, 3)).toEqual(-1);
  expect(getX(1, 3)).toEqual(0);
  expect(getX(2, 3)).toEqual(1);
});

test("parse", () => {
  expect(parse("")).toEqual([]);

  expect(parse("e.e/nsns/w.w")).toEqual([
    { direction: "east", x: -1, y: 0 },
    { direction: [], shape: "none", x: 0, y: 0 },
    { direction: "east", x: 1, y: 0 },
    { direction: "north", x: -1.5, y: 1 },
    { direction: "south", x: -0.5, y: 1 },
    { direction: "north", x: 0.5, y: 1 },
    { direction: "south", x: 1.5, y: 1 },
    { direction: "west", x: -1, y: 2 },
    { direction: [], shape: "none", x: 0, y: 2 },
    { direction: "west", x: 1, y: 2 },
  ]);

  expect(parse("1> 2> . . / . . 6< 5<")).toEqual([
    { direction: "east", label: "1", x: -1.5, y: 0 },
    { direction: "east", label: "2", x: -0.5, y: 0 },
    { direction: [], shape: "none", x: 0.5, y: 0 },
    { direction: [], shape: "none", x: 1.5, y: 0 },
    { direction: [], shape: "none", x: -1.5, y: 1 },
    { direction: [], shape: "none", x: -0.5, y: 1 },
    { direction: "west", label: "6", x: 0.5, y: 1 },
    { direction: "west", label: "5", x: 1.5, y: 1 },
  ]);
});
