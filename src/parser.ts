import { Color, Dancer, Direction, Shape } from "./dancer.js";
import { Simplify } from "./utils.js";

type Attributes = Omit<Dancer, "x" | "y">;

type AttributesWithDirection = Simplify<
  Attributes & Required<Pick<Attributes, "direction">>
>;

const SYMBOLS: { [key: string]: Attributes } = {
  "^": { direction: Direction.North },
  ">": { direction: Direction.East },
  v: { direction: Direction.South },
  V: { direction: Direction.South },
  "<": { direction: Direction.West },
  n: { direction: Direction.North },
  e: { direction: Direction.East },
  s: { direction: Direction.South },
  w: { direction: Direction.West },
  // "headliner", "sideliner"
  H: { direction: [Direction.North, Direction.South] },
  S: { direction: [Direction.East, Direction.West] },
  ",": { direction: [] },
  "@": { direction: [] },
  "*": { direction: [] },
  "+": { direction: [], label: "+", shape: Shape.None },
  ".": { direction: [], shape: Shape.None },
  o: { label: "o" },
  x: { label: "x" },
  0: { label: "0" },
  1: { label: "1" },
  2: { label: "2" },
  3: { label: "3" },
  4: { label: "4" },
  5: { label: "5" },
  6: { label: "6" },
  7: { label: "7" },
  8: { label: "8" },
  9: { label: "9" },
  r: { color: Color.Red },
  b: { color: Color.Blue },
  g: { color: Color.Green },
  y: { color: Color.Yellow },
  p: { phantom: true },
  O: { shape: Shape.Circle },
};

export function parseRow(row: string): AttributesWithDirection[] {
  const result: AttributesWithDirection[] = [];
  let partial: Attributes = {};

  const pushIfDone = () => {
    if (partial.direction) {
      result.push(partial as AttributesWithDirection);
      partial = {};
    }
  };

  for (const char of row) {
    const attrs = SYMBOLS[char];
    if (attrs) {
      partial = { ...partial, ...attrs };
      pushIfDone();
    }
  }
  pushIfDone();

  return result;
}

export function getX(i: number, length: number): number {
  return i + 0.5 - length / 2;
}

export function parse(spec: string): Dancer[] {
  return spec
    .split(/\n|\//)
    .map(parseRow)
    .flatMap((row, y) =>
      row.map((attrs, i) => ({
        ...attrs,
        x: getX(i, row.length),
        y,
      }))
    );
}
