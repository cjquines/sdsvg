import { SVG, registerWindow } from "@svgdotjs/svg.js";

import { Dancer, DancerResolved, resolveDancer } from "./dancer.js";
import { geometrize } from "./geometry.js";
import {
  Options,
  OptionsResolved,
  defaultOptions,
  resolveOptions,
} from "./options.js";
import { parse } from "./parser.js";
import { Renderer } from "./renderer.js";

export class Formation {
  dancers: DancerResolved[];
  options: OptionsResolved;

  constructor(input: string | Dancer[], options?: Options) {
    this.options = options ? resolveOptions(options) : defaultOptions;
    const {
      layout: { geometry, origin },
    } = this.options;

    const dancers = typeof input === "string" ? parse(input) : input;
    this.dancers = dancers.flatMap((dancer) =>
      geometrize(resolveDancer(dancer), geometry, origin),
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

  async toStringAsync(): Promise<string> {
    // only works if svgdom is installed as a peer dep
    const { createSVGWindow } = await import("svgdom");
    const window = createSVGWindow();
    const document = window.document;
    registerWindow(window, document);
    return this.toString(document.documentElement);
  }
}

export function formationToSvg(
  input: string | Dancer[],
  options?: Options,
): string {
  return new Formation(input, options).toString();
}
