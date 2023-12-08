import ColorJS from "colorjs.io";

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

const COLOR_TO_HEX: { [color in Color]: string } = {
  [Color.Black]: "#000000",
  [Color.Red]: "#e53e3e",
  [Color.Green]: "#38a169",
  [Color.Blue]: "#3182ce",
  [Color.Yellow]: "#d69e2e",
};

export const toHex = (rawColor: Color | string, opacity: number): string => {
  const color = new ColorJS(
    rawColor in COLOR_TO_HEX ? COLOR_TO_HEX[rawColor as Color] : rawColor
  );
  color.alpha = opacity;
  return color.toString({ format: "hex" });
};

export enum Shape {
  None = "none",
  Square = "square",
  Circle = "circle",
}

export type Attributes = {
  direction: Direction | Direction[];
  label: string;
  dashed: boolean;
  color?: Color | string;
  shape?: Shape;
};

export type Point = {
  x: number;
  y: number;
};

export type Dancer = Point & Attributes;
