export enum Direction {
  North = "north",
  East = "east",
  South = "south",
  West = "west",
}

export enum Color {
  Black = "black",
  Red = "red",
  Green = "green",
  Blue = "blue",
  Yellow = "yellow",
}

export enum Shape {
  None = "none",
  Square = "square",
  Circle = "circle",
}

export type Point = {
  x: number;
  y: number;
};

export type Attributes = {
  direction: Direction | Direction[];
  label: string;
  color: Color | string;
  dashed: boolean;
  shape: Shape;
};

export type Dancer = Point & Attributes;

export enum Geometry {
  None = "none",
  Bigon = "bigon",
  Square = "square",
  Hexagon = "hexagon",
}

export type Options = {
  dancerSize: number;
  noseSize: number;
  horizontalSpace: number;
  verticalSpace: number;
  strokeWidth: number;
  phantomDashArray: number;
  geometry: Geometry;
  origin: Point;
};
