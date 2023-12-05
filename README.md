# svg-squares

render square dance formations as SVGs

```ts
import { formationToSvg, Formation } from "svg-squares";

formationToSvg(`1> 2> . . / . . 6< 5<`);

const formation = new Formation(`e.e/nsns/w.w`, {
  squareSize: 16,
  strokeWidth: 1,
});
formation.renderTo(document.getElementById("#svg"));

formationToSvg(
  [
    { x: 0, y: 0, direction: "north", label: "A", color: "blue" },
    { x: 1, y: 0, direction: ["north", "south"], label: "B", dashed: true },
  ],
  {
    geometry: "hexagon",
    origin: { x: 0.5, y: 1.5 },
  },
);
```

default sizes:
- 1 unit: square size (default 1em text-height + 0.2em + 0.2em in padding)
- 0.4 units: nose size
- 1.4 units: edge-to-edge spacing (h spacing, v spacing)

inspiration:
- [tex-squares.sty](https://www.mit.edu/~tech-squares/resources/tex/)
- [FormationBot](https://gitlab.com/tech-squares/formationbot)
