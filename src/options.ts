import { Color, Point, Shape } from "./dancer";

export enum Geometry {
  None = "none",
  Bigon = "bigon",
  Square = "square",
  Hexagon = "hexagon",
}

export type Options = {
  body: {
    size: number;
    shape: Shape;
    color: Color | string;
    opacity: number;
  };
  nose: {
    size: number;
    distance: number;
    color: Color | string;
    opacity: number;
  };
  stroke: {
    width: number;
    phantomDashArray: number[];
  };
  label: {
    size: number;
    family: string;
    color: Color | string;
    opacity: number;
  };
  space: {
    padding: number;
    horizontal: number;
    vertical: number;
  };
  layout: {
    geometry: Geometry;
    origin: Point;
  };
};

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type PartialOptions = DeepPartial<Options>;

export const extendOptions = (options: DeepPartial<Options>): Options => {
  const result = options;

  result.body ??= {};
  result.body.size ??= 30;
  result.body.shape ??= Shape.Square;
  result.body.color ??= Color.Black;
  result.body.opacity ??= 0;

  result.nose ??= {};
  result.nose.size ??= result.body.size * 0.3;
  result.nose.distance ??= result.body.size / 2 + result.nose.size / 4;
  result.nose.color ??= result.body.color;
  result.nose.opacity ??= 1;

  result.stroke ??= {};
  result.stroke.width ??= Math.max(1, result.body.size / 12);
  result.stroke.phantomDashArray ??= [
    result.body.size * 0.3,
    result.body.size * 0.2,
  ];

  result.label ??= {};
  result.label.size ??= result.body.size * 0.8;
  result.label.family ??= "Open Sans";
  result.label.color ??= result.body.color;
  result.label.opacity ??= 1;

  result.space ??= {};
  result.space.padding ??= result.body.size / 2;
  result.space.horizontal ??= result.body.size + result.nose.size;
  result.space.vertical ??= result.body.size + result.nose.size;

  result.layout ??= {};
  result.layout.geometry ??= Geometry.None;
  result.layout.origin ??= { x: 0, y: 0 };

  return result as Options;
};
