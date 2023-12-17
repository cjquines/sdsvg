import { Color, Shape, toHex } from "./dancer.js";
import { Geometry } from "./geometry.js";
import { Simplify } from "./utils.js";

/**
 * Sizes can be specified as:
 * - the number of pixels, e.g. 30 represents 30 px.
 * - a scale factor, e.g. "*2" represents twice the default.
 * - a percentage, e.g. "50%" represents half the default.
 */
type Size = number | `*${number}` | `${number}%`;

type BodyOptions = {
  /**
   * Shape of the dancer's bodies.
   * Default: square.
   */
  shape?: Shape;
  /**
   * Diameter of the dancer's bodies.
   * Default: 30.
   */
  size?: Size;
  /**
   * Stroke color of the dancer's bodies, as a preset color, or a CSS string.
   * Default: black.
   */
  strokeColor?: Color | string;
  /**
   * Stroke width of the dancer's bodies.
   * Default: max(1, body size / 12).
   */
  strokeWidth?: Size;
  /**
   * The stroke dash array of a phantom dancer's body.
   * Default: [body size / 5]
   */
  phantomDashArray?: Size[];
  /**
   * Fill color of the dancer's bodies, as a preset color, or a CSS string.
   * Default: stroke color.
   */
  fillColor?: Color | string;
  /**
   * Fill opacity of the dancer's bodies, as a number between 0 and 1.
   * Default: 0.
   */
  fillOpacity?: number;
};

type BodyOptionsResolved = Simplify<
  Required<Omit<BodyOptions, "phantomDashArray">> & {
    size: number;
    strokeWidth: number;
    phantomDashArray: number[];
  }
>;

type NoseOptions = {
  /**
   * Shape of the dancer's noses.
   * Default: circle.
   */
  shape?: Shape;
  /**
   * Diameter of the dancer's noses.
   * Default: body size / 3.
   */
  size?: Size;
  /**
   * Distance from the edge of the dancer's body to the center of their nose.
   * Default: nose size / 4.
   */
  distance?: Size;
  /**
   * Stroke color of the dancer's noses, as a preset color, or a CSS string.
   * Default: body stroke color.
   */
  strokeColor?: Color | string;
  /**
   * Stroke width of the dancer's noses.
   * Default: 0.
   */
  strokeWidth?: number;
  /**
   * Fill color of the dancer's noses, as a preset color, or a CSS string.
   * Default: stroke color.
   */
  fillColor?: Color | string;
  /**
   * Fill opacity of the dancer's noses, as a number between 0 and 1.
   * Default: 1.
   */
  fillOpacity?: number;
};

type NoseOptionsResolved = Simplify<
  Required<NoseOptions> & {
    size: number;
    distance: number;
  }
>;

type LabelOptions = {
  /**
   * Font size of the dancer labels.
   * Default: 0.8 * body size.
   */
  size?: Size;
  /**
   * Font family of the dancer labels.
   * Default: Open Sans.
   */
  family?: string;
  /**
   * Color of the dancer labels.
   * Default: body stroke color.
   */
  color?: Color | string;
  /**
   * Opacity of the dancer labels, as a number between 0 and 1.
   * Default: 1.
   */
  opacity?: number;
};

type LabelOptionsResolved = Simplify<
  Required<LabelOptions> & {
    size: number;
  }
>;

type LayoutOptions = {
  /**
   * Default spacing unit, used for padding and gap sizes.
   * Default: nose size * 2.
   */
  space?: Size;
  /**
   * Padding around generated SVG. You probably don't want this to be 0, as it
   * would cut off the dancer noses. I think?
   * Default: space.
   */
  padding?: Size;
  /**
   * Space between dancer edges. If an array is given, it's [vertical gap,
   * horizontal gap].
   * Default: space.
   */
  gap?: Size | [Size, Size];
  /**
   * Horizontal space between dancer edges. Overrides gap.
   * Default: space.
   */
  horizontalGap?: Size;
  /**
   * Vertical space between dancer edges. Overrides gap.
   * Default: space.
   */
  verticalGap?: Size;
  /**
   * Used to add additional dancers by symmetry, according to geometry.
   * Default: none.
   */
  geometry?: Geometry;
  /**
   * Origin used for computing positions with dancer geometry.
   * Default: { x: 0, y: 0 }.
   */
  origin?: { x: number; y: number };
};

type LayoutOptionsResolved = Simplify<
  Required<Omit<LayoutOptions, "space" | "gap">> & {
    padding: number;
    horizontalGap: number;
    verticalGap: number;
  }
>;

export type Options = {
  /** Options for drawing the dancer's bodies. */
  body?: BodyOptions;
  /** Options for drawing the dancer's noses. */
  nose?: NoseOptions;
  /** Options for drawing the dancer labels. */
  label?: LabelOptions;
  /** Options for the dancers' layout. */
  layout?: LayoutOptions;
};

export function defineOptions(options: Options): Options {
  return options;
}

function sized(defaultValue: number, value?: Size): number {
  if (!value) {
    return defaultValue;
  }
  if (typeof value === "number") {
    return value;
  }
  if (value.startsWith("*")) {
    return defaultValue * Number(value.slice(1));
  }
  if (value.endsWith("%")) {
    return defaultValue * (Number(value.slice(0, -1)) / 100);
  }
  throw new Error(`unknown size: ${value}`);
}

export type OptionsResolved = {
  body: BodyOptionsResolved;
  nose: NoseOptionsResolved;
  label: LabelOptionsResolved;
  layout: LayoutOptionsResolved;
};

export function resolveOptions(options: Readonly<Options>): OptionsResolved {
  // deep-ish copy:
  const r = {
    body: { ...options.body },
    nose: { ...options.nose },
    label: { ...options.label },
    layout: { ...options.layout },
  };
  // nothing below should touch options!

  r.body.shape ??= Shape.Square;
  r.body.size = sized(30, r.body.size);
  r.body.strokeColor = toHex(r.body.strokeColor ?? Color.Black);
  r.body.strokeWidth = sized(Math.max(1, r.body.size / 12), r.body.strokeWidth);
  r.body.phantomDashArray = (r.body.phantomDashArray ?? [r.body.size / 5]).map(
    (value) => sized((r.body!.size as number) / 5, value)
  );
  r.body.fillColor = toHex(r.body.fillColor ?? r.body.strokeColor);
  r.body.fillOpacity ??= 0;

  r.nose.shape ??= Shape.Circle;
  r.nose.size = sized(r.body.size / 3, r.nose.size);
  r.nose.distance = sized(r.nose.size / 4, r.nose.distance);
  r.nose.strokeColor = toHex(r.nose.strokeColor ?? r.body.strokeColor);
  r.nose.strokeWidth ??= 0;
  r.nose.fillColor = toHex(r.nose.fillColor ?? r.nose.strokeColor);
  r.nose.fillOpacity ??= 1;

  r.label.size = sized(0.8 * r.body.size, r.label.size);
  r.label.family ??= "Open Sans";
  r.label.color = toHex(r.label.color ?? r.body.strokeColor);
  r.label.opacity ??= 1;

  r.layout.space = sized(r.nose.size * 2, r.layout.space);
  r.layout.padding = sized(r.layout.space, r.layout.padding);
  r.layout.horizontalGap = sized(
    r.layout.space,
    r.layout.horizontalGap ??
      (Array.isArray(r.layout.gap) ? r.layout.gap[0] : r.layout.gap)
  );
  r.layout.verticalGap = sized(
    r.layout.space,
    r.layout.verticalGap ??
      (Array.isArray(r.layout.gap) ? r.layout.gap[1] : r.layout.gap)
  );
  r.layout.geometry ??= Geometry.None;
  r.layout.origin ??= { x: 0, y: 0 };

  return r as OptionsResolved;
}

export const defaultOptions = Object.freeze(resolveOptions({}));
