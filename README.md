# sdsvg

render square dance formations as SVGs

```ts
import { formationToSvg, Formation } from "sdsvg";

formationToSvg("1> 2> . . / . . 6< 5<");

const formation = new Formation("e.e/nsns/w.w", {
  body: { opacity: 0.2 },
  nose: { distance: 2 },
});
formation.toElement(document.getElementById("#svg"));

formationToSvg(
  [
    { x: 0, y: 0, direction: "north", label: "A", color: "blue" },
    { x: 1, y: 0, direction: ["north", "south"], label: "B", dashed: true },
  ],
  { layout: { geometry: "hexagon", origin: { x: 0.5, y: 1.5 } } },
);
```

![](https://raw.githubusercontent.com/cjquines/sdsvg/main/src/__image_snapshots__/sample1.png)
![](https://raw.githubusercontent.com/cjquines/sdsvg/main/src/__image_snapshots__/sample2.png)
![](https://raw.githubusercontent.com/cjquines/sdsvg/main/src/__image_snapshots__/sample3.png)

## inspiration

- [tex-squares.sty](https://www.mit.edu/~tech-squares/resources/tex/)
- [FormationBot](https://gitlab.com/tech-squares/formationbot)
