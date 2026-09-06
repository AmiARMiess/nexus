# NEXUS — Animated 3D-Style Landing Page Theme

> The infrastructure layer that *thinks* with your team.

**NEXUS** is a cinematic dark/light landing page with a living background:
glowing wireframe crystals, drifting particles, mouse parallax and a
scroll-driven camera — rendered by a **tiny built-in 3D projection engine on
plain Canvas 2D**. Zero libraries, zero CDN, zero build step.
Double-click `index.html` and it just works — even offline.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)]()
[![Build](https://img.shields.io/badge/build-not%20required-brightgreen.svg)]()

<img width="1349" height="4895" alt="image" src="https://github.com/user-attachments/assets/467dfad4-a37f-4b6d-83ba-aa83cd597cf6" />
<img width="1349" height="4895" alt="image" src="https://github.com/user-attachments/assets/bfbf11cd-867b-4995-9d3c-d2e4c98852d4" />

---

## ✨ Features

- 💎 **Animated 3D-style background** — icosahedron, torus-knot, octahedron,
  tetrahedron & ring, drawn by a dependency-free wireframe engine
- 🖱️ **Mouse parallax** — shapes and particles follow the cursor
- 📜 **Scroll camera** — the scene pulls back as you scroll
- 🌗 **Dark / Light toggle** — flips UI *and* scene palette, saved to `localStorage`
- ✨ **Neon glow** — additive blending in dark mode, clean strokes in light mode
- 🔋 **Respectful** — static frame on mobile / `prefers-reduced-motion`
- 🪟 **Glassmorphic cards**, gradient stats, syntax-highlighted code card
- 🎭 **Giant stroke watermark** ("NEXUS") in the footer
- 📱 **Fully responsive**, no framework, no build step, works from `file://`

## 🚀 Quick Start

```bash
git clone https://github.com/AmiARMiess/nexus.git
cd nexus
open index.html        # yes, really — no server needed
```

Fonts load from Google Fonts when online; everything else is fully local.

## 📁 Structure

```
nexus/
├── index.html     # page + inline theme engine (runs before paint)
├── style.css      # design tokens, dark/light themes, layout
├── script.js      # canvas 3D engine, parallax, reveals, nav
├── README.md      # this file
└── .gitattributes # line-ending + linguist rules
```

## 🧩 Sections

| Section  | Content                                            |
|----------|----------------------------------------------------|
| Hero     | Beta pill, gradient headline, dual CTAs            |
| Features | 4 glass capability cards                           |
| Platform | Gradient stat grid + 6-logo trust strip            |
| Why      | Two-column split narrative                         |
| Docs     | "quickstart.ts" code card with traffic-light dots  |
| CTA      | Radial-glow banner                                 |
| Footer   | 4-column links + giant outlined watermark          |

## 🎨 Theming

**UI colors** — `:root` / `:root.light` in `style.css`:

```css
:root{
  --bg:#07070C; --ink:#EDEDF2; --mut:#8A8A99;
  --accent:#7C5CFF; --accent-2:#39E5FF;
  --grad:linear-gradient(135deg,#7C5CFF,#39E5FF);
}
```

**Scene colors** — the `PAL` object in `script.js`:

```js
var PAL = {
  dark:  ['#8B6CFF', '#4FE7FF', '#FF5FAE', '#E8E8FF'],
  light: ['#6D4AFF', '#0891B2', '#D23B8C', '#3A3A55']
};
```

Rebrand by editing the wordmark, the watermark text, and these two palettes.

## 🤔 Why not Three.js?

Earlier prototypes used Three.js + UnrealBloom, but ES modules and CDN
scripts silently fail when a page is opened from `file://`, offline, or in
restricted webviews. The built-in Canvas 2D engine reproduces the look
(wireframe crystals, glow, parallax) with **zero failure modes** — the page
degrades to nothing gracefully and never breaks the content.

## ⚙️ Performance

- ~260 line segments + 130 particles per frame — trivially 60 fps
- Pixel ratio capped at 2
- Single `stroke()` call per shape (batched paths)
- Reduced-motion / narrow screens render one static frame

## 🧑‍ Browser Support

Any browser with Canvas 2D and `IntersectionObserver`
(Chrome, Firefox, Safari, Edge — including older builds). No polyfills.

## 📄 License

MIT — free for personal and commercial use.

---

*Ship the next era.*
