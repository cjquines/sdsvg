import { Attributes, Color, Dancer, Direction, Shape } from ".";

const SYMBOLS: { [key: string]: Partial<Attributes> } = {
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
  p: { dashed: true },
  O: { shape: Shape.Circle },
};

const defaultAttrs: Omit<Attributes, "direction"> = {
  label: "",
  dashed: false,
};

export function parseRow(row: string): Attributes[] {
  const result: Attributes[] = [];
  let partial: Partial<Attributes> = defaultAttrs;

  const pushIfDone = () => {
    if (partial.direction) {
      result.push(partial as Attributes);
      partial = defaultAttrs;
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
