import { Color, Shape } from "./dancer.js";
import { Geometry } from "./geometry.js";

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
    origin: { x: number; y: number };
  };
};

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export type PartialOptions = DeepPartial<Options>;

export function makeOptions(options: PartialOptions): Options {
  const result = { ...options };

  result.body = { ...result.body };
  result.body.size ??= 30;
  result.body.shape ??= Shape.Square;
  result.body.color ??= Color.Black;
  result.body.opacity ??= 0;

  result.nose = { ...result.nose };
  result.nose.size = result.body.size * 0.3 * (options.nose?.size ?? 1);
  result.nose.distance =
    result.body.size / 2 +
    result.nose.size / 4 +
    (options.nose?.distance ?? 0) * result.nose.size;
  result.nose.color ??= result.body.color;
  result.nose.opacity ??= 1;

  result.stroke = { ...result.stroke };
  result.stroke.width ??= Math.max(1, result.body.size / 12);
  result.stroke.phantomDashArray ??= [
    result.body.size * 0.3,
    result.body.size * 0.2,
  ];

  result.label = { ...result.label };
  result.label.size = result.body.size * 0.8 * (options.label?.size ?? 1);
  result.label.family ??= "Open Sans";
  result.label.color ??= result.body.color;
  result.label.opacity ??= 1;

  result.space = { ...result.space };
  result.space.padding ??= result.body.size / 2;
  result.space.horizontal =
    (result.body.size + result.nose.size) * (options.space?.horizontal ?? 1);
  result.space.vertical =
    (result.body.size + result.nose.size) * (options.space?.vertical ?? 1);

  result.layout = { ...result.layout };
  result.layout.geometry ??= Geometry.None;
  result.layout.origin ??= { x: 0, y: 0 };

  return result as Options;
}
