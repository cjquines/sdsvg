enum Direction {
  North = "north",
  East = "east",
  South = "south",
  West = "west",
}

enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow",
}

type Point = {
  x: number;
  y: number;
};

type Dancer = Point & {
  direction: Direction | Direction[];
  label: string;
  color: Color | string;
  dashed: boolean;
};

enum Geometry {
  None = "none",
  Bigon = "bigon",
  Square = "square",
  Hexagon = "hexagon",
}

type Options = {
  geometry: Geometry;
  origin: Point;
  noseSize: number;
  squareSize: number;
  horizontalSpace: number;
  veritcalSpace: number;
  phantomDash: string;
  strokeWidth: number;
};
