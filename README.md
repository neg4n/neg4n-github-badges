# Badge Data & Shields URL Builders

Badge Data & Shields URL Builders is a small, typed helper I use across my personal projects to generate themed Shields.io badge assets for Markdown or HTML embeds.


## Usage

Install it with your package manager of choice:

```bash
pnpm add @igorklepacki/github-badges
# or
npm install @igorklepacki/github-badges
# or
yarn add @igorklepacki/github-badges
```

Create a badge by importing one of the builders. Each builder returns a `BadgeAsset` with alt text, href, and dark/light image sources ready to drop into documentation.

```ts
import { buildNpmDownloadsBadge } from "@igorklepacki/github-badges"

const downloads = buildNpmDownloadsBadge({
  packageName: "react",
})

console.log(downloads.alt)
console.log(downloads.src)
```

## Extending

This build wraps a private collection of helpers and intentionally exposes only the four badge builders. If you need additional badge shapes, copy one of the existing variants and tailor it in your project – each variant is a thin layer over `buildAsset` inside this package.

You can still pass `baseUrl`, `themePresets`, `baseTheme`, `extraQuery`, `logo`, and `style` overrides to the public builders to suit custom Shields instances or colour palettes.

## License

MIT © Igor Klepacki
