import ColorJS from "colorjs.io";

import { Enumify } from "./utils";

export const Direction = {
  North: "north",
  East: "east",
  South: "south",
  West: "west",
} as const;

export type Direction = Enumify<typeof Direction>;

export const Color = {
  Black: "black",
  Red: "red",
  Green: "green",
  Blue: "blue",
  Yellow: "yellow",
} as const;

export type Color = Enumify<typeof Color>;

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

export const Shape = {
  None: "none",
  Square: "square",
  Circle: "circle",
} as const;

export type Shape = Enumify<typeof Shape>;

export type Attributes = {
  direction: Direction | Direction[];
  label: string;
  dashed: boolean;
  rotate: number;
  color?: Color | string;
  shape?: Shape;
};

export type Dancer = Attributes & {
  x: number;
  y: number;
};
