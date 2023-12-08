import { expect, test } from "vitest";

import { getX, parse, parseRow } from "./parser";

test("parseRow", () => {
  expect(parseRow("")).toEqual([]);

  expect(parseRow("nsns")).toEqual([
    { dashed: false, direction: "north", label: "" },
    { dashed: false, direction: "south", label: "" },
    { dashed: false, direction: "north", label: "" },
    { dashed: false, direction: "south", label: "" },
  ]);

  expect(parseRow("1> 2> . .")).toEqual([
    { dashed: false, direction: "east", label: "1" },
    { dashed: false, direction: "east", label: "2" },
    { dashed: false, direction: [], label: "", shape: "none" },
    { dashed: false, direction: [], label: "", shape: "none" },
  ]);

  expect(parseRow("r@ pyx. p3bon dp*")).toEqual([
    { color: "red", dashed: false, direction: [], label: "" },
    { color: "yellow", dashed: true, direction: [], label: "x", shape: "none" },
    { color: "blue", dashed: true, direction: "north", label: "o" },
    { dashed: true, direction: [], label: "" },
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

  expect(parse(".")).toEqual([
    { dashed: false, direction: [], label: "", shape: "none", x: 0, y: 0 },
  ]);

  expect(parse("e.e/nsns/w.w")).toEqual([
    { dashed: false, label: "", direction: "east", x: -1, y: 0 },
    { dashed: false, label: "", direction: [], shape: "none", x: 0, y: 0 },
    { dashed: false, label: "", direction: "east", x: 1, y: 0 },
    { dashed: false, label: "", direction: "north", x: -1.5, y: 1 },
    { dashed: false, label: "", direction: "south", x: -0.5, y: 1 },
    { dashed: false, label: "", direction: "north", x: 0.5, y: 1 },
    { dashed: false, label: "", direction: "south", x: 1.5, y: 1 },
    { dashed: false, label: "", direction: "west", x: -1, y: 2 },
    { dashed: false, label: "", direction: [], shape: "none", x: 0, y: 2 },
    { dashed: false, label: "", direction: "west", x: 1, y: 2 },
  ]);

  expect(parse("1> 2> . . / . . 6< 5<")).toEqual([
    { dashed: false, direction: "east", label: "1", x: -1.5, y: 0 },
    { dashed: false, direction: "east", label: "2", x: -0.5, y: 0 },
    { dashed: false, direction: [], label: "", shape: "none", x: 0.5, y: 0 },
    { dashed: false, direction: [], label: "", shape: "none", x: 1.5, y: 0 },
    { dashed: false, direction: [], label: "", shape: "none", x: -1.5, y: 1 },
    { dashed: false, direction: [], label: "", shape: "none", x: -0.5, y: 1 },
    { dashed: false, direction: "west", label: "6", x: 0.5, y: 1 },
    { dashed: false, direction: "west", label: "5", x: 1.5, y: 1 },
  ]);
});
