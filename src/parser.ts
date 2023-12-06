import { Attributes, Color, Dancer, Direction, Shape } from ".";

type Symbol =
  | { type: "direction"; value: Direction | Direction[] }
  | { type: "label"; value: string }
  | { type: "color"; value: Color }
  | { type: "dashed"; value: boolean }
  | { type: "shape"; value: Shape };

const symbols: { [key: string]: Symbol | Symbol[] } = {
  "^": { type: "direction", value: Direction.North },
  ">": { type: "direction", value: Direction.East },
  v: { type: "direction", value: Direction.South },
  V: { type: "direction", value: Direction.South },
  "<": { type: "direction", value: Direction.West },
  n: { type: "direction", value: Direction.North },
  e: { type: "direction", value: Direction.East },
  s: { type: "direction", value: Direction.South },
  w: { type: "direction", value: Direction.West },
  // "headliner", "sideliner"
  H: { type: "direction", value: [Direction.North, Direction.South] },
  S: { type: "direction", value: [Direction.East, Direction.West] },
  ",": { type: "direction", value: [] },
  "@": { type: "direction", value: [] },
  "*": { type: "direction", value: [] },
  "+": [
    { type: "direction", value: [] },
    { type: "label", value: "+" },
    { type: "shape", value: Shape.None },
  ],
  ".": [
    { type: "direction", value: [] },
    { type: "shape", value: Shape.None },
  ],
  o: { type: "label", value: "o" },
  x: { type: "label", value: "x" },
  0: { type: "label", value: "0" },
  1: { type: "label", value: "1" },
  2: { type: "label", value: "2" },
  3: { type: "label", value: "3" },
  4: { type: "label", value: "4" },
  5: { type: "label", value: "5" },
  6: { type: "label", value: "6" },
  7: { type: "label", value: "7" },
  8: { type: "label", value: "8" },
  9: { type: "label", value: "9" },
  r: { type: "color", value: Color.Red },
  b: { type: "color", value: Color.Blue },
  g: { type: "color", value: Color.Green },
  y: { type: "color", value: Color.Yellow },
  p: { type: "dashed", value: true },
  O: { type: "shape", value: Shape.Circle },
};
