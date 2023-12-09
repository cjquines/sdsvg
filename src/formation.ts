import { SVG } from "@svgdotjs/svg.js";

import { Dancer } from "./dancer";
import { geometrize } from "./geometry";
import { Options, PartialOptions, makeOptions } from "./options";
import { PartialDancer, dancerify, parse } from "./parser";
import { Renderer } from "./renderer";
import { makeSvg } from "./utils";

export class Formation {
  dancers: Dancer[];
  options: Options;

  constructor(input: string | PartialDancer[], options?: PartialOptions) {
    this.options = makeOptions(options ?? {});
    const {
      layout: { geometry, origin },
    } = this.options;

    const dancers = typeof input === "string" ? parse(input) : input;
    this.dancers = dancers.flatMap((dancer) =>
      geometrize(dancerify(dancer), geometry, origin)
    );
  }

  private drawDancers(renderer: Renderer): void {
    this.dancers.forEach((dancer) => renderer.drawDancer(dancer));
    renderer.resizeImage();
  }

  toElement(element: SVGSVGElement): void {
    this.drawDancers(new Renderer(this.options, SVG(element)));
  }

  toString(): string {
    const render = new Renderer(this.options, makeSvg());
    this.drawDancers(render);
    return render.draw.svg();
  }
}

export function formationToSvg(
  input: string | PartialDancer[],
  options?: PartialOptions
): string {
  return new Formation(input, options).toString();
}
