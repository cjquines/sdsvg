import { SVG } from "@svgdotjs/svg.js";

import { Dancer } from "./dancer.js";
import { geometrize } from "./geometry.js";
import { Options, PartialOptions, makeOptions } from "./options.js";
import { PartialDancer, dancerify, parse } from "./parser.js";
import { Renderer } from "./renderer.js";

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

  toString(element?: SVGSVGElement): string {
    const render = new Renderer(this.options, element ? SVG(element) : SVG());
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
