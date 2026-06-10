# Jared Augustin — Portfolio

A minimal, fast, fully static portfolio site for painter **Jared Augustin**
(Newcastle, Ontario). The homepage is a scattered, non-uniform mosaic of works;
each tile links to a dedicated detail page.

No build step, no framework — just HTML, CSS, and a little vanilla JavaScript.
Deploys automatically to GitHub Pages.

## Managing the artwork

Everything is driven by a single file: **`data.js`**. Each work is one object in
the `ARTWORKS` array.

```js
{
  id: "harbour-light",          // unique slug, becomes piece.html?id=harbour-light
  title: "Harbour Light",
  width: 24, height: 36,        // canvas size in inches — sets the label AND the
                                //   tile's aspect ratio (portrait/landscape)
  medium: "Oil on canvas",
  image: "…/933/1400",          // full-size image (detail page)
  thumb: "…/400/600",           // small image (homepage mosaic, loads fast)
  description: "…",
}
```

- **Add** a piece: copy a block, give it a unique `id`, fill it in.
- **Remove** a piece: delete its block.
- **Edit** a piece: change its fields.

The mosaic and the detail pages regenerate themselves from this data — no other
files need to be touched.

### Swapping in real artwork

The sample images point at [picsum.photos](https://picsum.photos) placeholders.
When Jared's real photos are ready, replace each `image`/`thumb` URL with the
real file. Keep two sizes per piece — a large one for `image` and a smaller one
for `thumb` — so the homepage stays quick to load.

## Files

| File          | Purpose                                          |
| ------------- | ------------------------------------------------ |
| `index.html`  | Homepage — the mosaic.                           |
| `piece.html`  | Detail page template (reads `?id=` from the URL).|
| `about.html`  | Artist bio + business contact email.             |
| `data.js`     | The artwork data — **edit this to manage works**.|
| `main.js`     | Rendering + animations.                          |
| `styles.css`  | All styling.                                      |

## Deployment

Pushing to the deployment branch triggers
`.github/workflows/deploy.yml`, which publishes the site to GitHub Pages.

One-time setup in the repo: **Settings → Pages → Build and deployment →
Source: GitHub Actions**.
