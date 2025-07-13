import ColorJS from "colorjs.io";

import { Enumify, Simplify } from "./utils.js";

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

export function toHex(rawColor: Color | string): string {
  return new ColorJS(
    rawColor in COLOR_TO_HEX ? COLOR_TO_HEX[rawColor as Color] : rawColor,
  ).toString({ format: "hex" });
}

export const Shape = {
  None: "none",
  Square: "square",
  Circle: "circle",
} as const;

export type Shape = Enumify<typeof Shape>;

export type Dancer = {
  /**
   * The dancer's horizontal coordinate, increasing from west to east. Units
   * are matrix spots.
   */
  x: number;
  /**
   * The dancer's vertical coordinate, increasing from north to south. Units
   * are matrix spots.
   */
  y: number;
  /**
   * The (possibly empty) list of directions of the dancer's nose.
   * Default: []
   */
  direction?: Direction | Direction[];
  /**
   * The dancer's label.
   * Default: ""
   */
  label?: string;
  /**
   * Whether the dancer is a phantom, and should be drawn with a dashed border.
   * Default: false
   */
  phantom?: boolean;
  /**
   * How much to rotate this dancer clockwise, in degrees. This does not rotate
   * the dancer's label.
   * Default: 0
   */
  rotate?: number;
  /**
   * Overrides the color used to draw the dancer's body and nose.
   */
  color?: Color | string;
  /**
   * Overrides the shape used to draw the dancer's body.
   */
  shape?: Shape;
};

export function defineDancers(dancers: Dancer[]): Dancer[] {
  return dancers;
}

export type DancerResolved = Simplify<
  Required<Omit<Dancer, "color" | "shape" | "direction">> &
    Pick<Dancer, "color" | "shape"> & {
      direction: Direction[];
    }
>;

export function resolveDancer(dancer: Dancer): DancerResolved {
  const r = { ...dancer };
  r.direction = Array.isArray(r.direction)
    ? r.direction
    : r.direction
      ? [r.direction]
      : [];
  r.label ??= "";
  r.phantom ??= false;
  r.rotate ??= 0;
  if (r.color) {
    r.color = toHex(r.color);
  }
  return r as DancerResolved;
}
