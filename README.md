# Visual Abstract Generator

A browser-based tool for creating publication-quality visual abstracts for systematic reviews and meta-analyses, in BMJ-style and JAMA-style layouts.

**→ [yukifurukawa.jp/va](https://yukifurukawa.jp/va)**

---

## Features

- **Two templates**: BMJ-like (1024×1024 px) and JAMA-like (1200×675 px)
- **Summary of Findings (SoF) table** with directional arrows and GRADE certainty badges
- **Donut chart** visualization for dichotomous outcomes (JAMA template)
- **Image upload** for population, intervention, and control with background removal
- **Image position offset** controls (X/Y nudge in pixels)
- **Color palettes**: Classic, Crimson, Forest, Violet, Slate, and fully Custom (HEX input)
- **Font selection**: Calibri, Inter, Arial, Times New Roman, Georgia
- **Export**: PNG (SNS 1×, Journal 300 DPI), PDF (90×90 mm square, A4 portrait)
- **YAML/Markdown import-export** for reproducible workflows
- Fully **client-side** — no server, no data upload, works offline

---

## Tech stack

| Library | Purpose |
|---------|---------|
| [Fabric.js v6](https://fabricjs.com/) | Canvas rendering |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF export |
| [@imgly/background-removal](https://github.com/imgly/background-removal-js) | Client-side background removal |
| [Vite](https://vitejs.dev/) | Build tool |

---

## License

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) © [Furukawa Y](https://yukifurukawa.jp)

You are free to share and adapt this tool for any purpose, provided appropriate credit is given.
