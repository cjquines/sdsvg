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
    const renderer = new Renderer(this.options);
    this.drawDancers(renderer);
    const viewBox = renderer.viewBox;
    if (viewBox) element.setAttribute("viewBox", viewBox);
    element.innerHTML = renderer.innerContent();
  }

  toString(): string {
    const renderer = new Renderer(this.options);
    this.drawDancers(renderer);
    return renderer.svg();
  }
}

export function formationToSvg(
  input: string | Dancer[],
  options?: Options,
): string {
  return new Formation(input, options).toString();
}
