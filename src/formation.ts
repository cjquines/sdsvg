import { SVG } from "@svgdotjs/svg.js";

import { Dancer } from "./dancer";
import { Options, PartialOptions, extendOptions } from "./options";
import { parse } from "./parser";
import { Renderer } from "./renderer";
import { makeSvg } from "./utils";

export class Formation {
  dancers: Dancer[];
  options: Options;

  constructor(input: string, options?: PartialOptions) {
    this.dancers = parse(input);
    // TODO geometry
    this.options = extendOptions(options ?? {});
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
  input: string,
  options?: PartialOptions
): string {
  return new Formation(input, options).toString();
}
