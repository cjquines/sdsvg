import { Dancer } from "./dancer";

export enum Geometry {
  None = "none",
  Bigon = "bigon",
  Square = "square",
  Hexagon = "hexagon",
}

export class Point {
  constructor(public x: number, public y: number) {}

  fn = (f: (x: number, y: number) => [number, number]) => {
    const [nx, ny] = f(this.x, this.y);
    return new Point(nx, ny);
  };

  add = (q: Point) => this.fn((x, y) => [x + q.x, y + q.y]);
  sub = (q: Point) => this.add(q.mul(-1));
  mul = (k: number) => this.fn((x, y) => [k * x, k * y]);

  angle = () => Math.atan2(this.y, this.x);
  angleTo = (q: Point) => this.sub(q).angle();

  matMul = ([[a, b], [c, d]]: [[number, number], [number, number]]) =>
    this.fn((x, y) => [a * x + b * y, c * x + d * y]);

  rotate = (angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return this.matMul([
      [cos, -sin],
      [sin, cos],
    ]);
  };
  rotateAround = (angle: number, q: Point) => this.sub(q).rotate(angle).add(q);

  geometrizeAngles = (geometry: Geometry, o: Point): number[] => {
    switch (geometry) {
      case Geometry.None: {
        return [0];
      }
      case Geometry.Bigon: {
        return [this.angleTo(o)];
      }
      case Geometry.Square: {
        return [0, Math.PI];
      }
      case Geometry.Hexagon: {
        return [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
      }
    }
  };

  with = (dancer: Dancer): Dancer => ({ ...dancer, x: this.x, y: this.y });
  static from = ({ x, y }: { x: number; y: number }) => new Point(x, y);
}

export function geometrize(
  dancer: Dancer,
  geometry: Geometry,
  origin: { x: number; y: number }
): Dancer[] {
  const p = Point.from(dancer);
  const o = Point.from(origin);

  const angles = p.geometrizeAngles(geometry, o);

  return angles.map((angle, i) => ({
    ...p.rotateAround(angle, o).with(dancer),
    rotate: (angles[i] * 180) / Math.PI,
  }));
}
