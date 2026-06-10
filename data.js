/*
 * ============================================================================
 *  ARTWORK DATA — single source of truth for the whole site.
 * ============================================================================
 *
 *  To ADD a piece:    copy a block below, give it a unique `id`, fill it in.
 *  To REMOVE a piece: delete its block.
 *  To EDIT a piece:   change the fields in its block.
 *
 *  Field reference:
 *    id          unique slug, used in the URL (piece.html?id=THIS). No spaces.
 *    title       display name of the piece.
 *    image       full-size image URL (shown on the dedicated piece page).
 *    thumb       small image URL used on the homepage mosaic (loads fast).
 *    width/height  the canvas dimensions in inches. These drive BOTH the
 *                  displayed canvas size ("24 × 36 in") AND the tile's aspect
 *                  ratio in the mosaic, so portrait/landscape just works.
 *    medium      e.g. "Oil on canvas", "Acrylic & ink on panel".
 *    description longer text shown on the dedicated page.
 *
 *  Images: these point at picsum.photos as stock placeholders. Swap the
 *  `image`/`thumb` URLs for Jared's real artwork when ready — nothing else
 *  needs to change. The `thumb` requests a smaller render for fast loading;
 *  `image` requests a large render for the detail page.
 * ============================================================================
 */

// Helper to build a stable stock image at a given pixel size from a seed id.
const stock = (seed, w, h) => `https://picsum.photos/id/${seed}/${w}/${h}`;

const ARTWORKS = [
  {
    id: "harbour-light",
    title: "Harbour Light",
    width: 24, height: 36,
    medium: "Oil on canvas",
    image: stock(1015, 933, 1400),
    thumb: stock(1015, 400, 600),
    description:
      "A study of late evening on the water, where the last warmth of the day collapses into the cool of the harbour. Built up in thin, deliberate layers to hold the glow of the horizon.",
  },
  {
    id: "open-field",
    title: "Open Field",
    width: 36, height: 24,
    medium: "Oil on canvas",
    image: stock(1016, 1400, 933),
    thumb: stock(1016, 600, 400),
    description:
      "Wide and unhurried. A landscape that asks you to slow down and let your eye wander the length of it, the way the land itself unfolds outside Newcastle in the long light of August.",
  },
  {
    id: "still-morning",
    title: "Still Morning",
    width: 30, height: 30,
    medium: "Acrylic on canvas",
    image: stock(1025, 1200, 1200),
    thumb: stock(1025, 500, 500),
    description:
      "A square meditation on quiet. The composition turns inward, resolving toward a single point of stillness near the centre of the canvas.",
  },
  {
    id: "northern-pine",
    title: "Northern Pine",
    width: 18, height: 24,
    medium: "Acrylic on canvas",
    image: stock(1018, 1050, 1400),
    thumb: stock(1018, 450, 600),
    description:
      "Vertical and grounded. The pine stands as a portrait rather than a landscape — a single subject given the full weight of the frame.",
  },
  {
    id: "low-tide",
    title: "Low Tide",
    width: 24, height: 18,
    medium: "Oil on panel",
    image: stock(1019, 1400, 1050),
    thumb: stock(1019, 600, 450),
    description:
      "The shoreline at its most honest, stripped back to wet sand and reflected sky. Painted on panel to keep the surface smooth and the marks crisp.",
  },
  {
    id: "winter-window",
    title: "Winter Window",
    width: 16, height: 20,
    medium: "Oil on canvas",
    image: stock(1027, 1120, 1400),
    thumb: stock(1027, 480, 600),
    description:
      "Interior warmth pressed against the cold of the glass. A small, intimate piece about looking out at a season that won't let you in.",
  },
  {
    id: "the-crossing",
    title: "The Crossing",
    width: 20, height: 16,
    medium: "Acrylic & ink on panel",
    image: stock(1031, 1400, 1120),
    thumb: stock(1031, 600, 480),
    description:
      "Ink lines cut across loose washes of acrylic, mapping a path that never quite settles. A piece about the space between two places.",
  },
  {
    id: "small-stone",
    title: "Small Stone",
    width: 12, height: 12,
    medium: "Oil on panel",
    image: stock(1033, 1000, 1000),
    thumb: stock(1033, 460, 460),
    description:
      "A tiny square, painted at arm's length over a single afternoon. Proof that a whole world fits inside twelve inches.",
  },
  {
    id: "long-shadow",
    title: "Long Shadow",
    width: 40, height: 30,
    medium: "Oil on canvas",
    image: stock(1035, 1400, 1050),
    thumb: stock(1035, 600, 450),
    description:
      "Late afternoon, when shadows stretch longer than the things that cast them. A large landscape built around that exaggerated, golden geometry.",
  },
  {
    id: "tall-grass",
    title: "Tall Grass",
    width: 30, height: 40,
    medium: "Acrylic on canvas",
    image: stock(1036, 1050, 1400),
    thumb: stock(1036, 450, 600),
    description:
      "Looking up through the meadow rather than across it. The vertical format lets the grasses lead the eye skyward.",
  },
  {
    id: "great-lake",
    title: "Great Lake",
    width: 48, height: 36,
    medium: "Oil on canvas",
    image: stock(1037, 1400, 1050),
    thumb: stock(1037, 600, 450),
    description:
      "The largest piece in the collection. An attempt to give an inland sea the scale it deserves — horizon, weather, and water held in a single breath.",
  },
  {
    id: "field-notes",
    title: "Field Notes",
    width: 11, height: 14,
    medium: "Watercolour on paper",
    image: stock(1039, 1100, 1400),
    thumb: stock(1039, 470, 600),
    description:
      "A quick study made on location and never reworked in the studio. Loose, immediate, and honest about the day it was made.",
  },
  {
    id: "cedar-line",
    title: "Cedar Line",
    width: 14, height: 11,
    medium: "Watercolour on paper",
    image: stock(1043, 1400, 1100),
    thumb: stock(1043, 600, 470),
    description:
      "A treeline read as a single horizontal gesture. Wet-into-wet so the cedars bleed softly into the sky behind them.",
  },
  {
    id: "quiet-harbour",
    title: "Quiet Harbour",
    width: 22, height: 28,
    medium: "Oil on canvas",
    image: stock(1044, 1100, 1400),
    thumb: stock(1044, 470, 600),
    description:
      "The harbour again, but turned to portrait — the masts and reflections stacked vertically into a calm, ordered column.",
  },
  {
    id: "the-narrows",
    title: "The Narrows",
    width: 28, height: 22,
    medium: "Oil on canvas",
    image: stock(1045, 1400, 1100),
    thumb: stock(1045, 600, 470),
    description:
      "Where the water tightens between two banks. A landscape composed around compression and release.",
  },
  {
    id: "shoreline-pan",
    title: "Shoreline (Panorama)",
    width: 60, height: 24,
    medium: "Oil on canvas",
    image: stock(1047, 1600, 640),
    thumb: stock(1047, 800, 320),
    description:
      "A true panorama. Five feet of coastline asking to be read left to right, like a sentence written in light.",
  },
  {
    id: "ascent",
    title: "Ascent",
    width: 24, height: 60,
    medium: "Acrylic on canvas",
    image: stock(1048, 640, 1600),
    thumb: stock(1048, 320, 800),
    description:
      "A tall, narrow climb of a painting. The eye has no choice but to travel upward, gaining altitude with every band of colour.",
  },
  {
    id: "study-in-blue",
    title: "Study in Blue",
    width: 9, height: 12,
    medium: "Gouache on paper",
    image: stock(1050, 900, 1200),
    thumb: stock(1050, 450, 600),
    description:
      "A small colour study that became its own finished thing. An exercise in how many blues can share a single sheet.",
  },
  {
    id: "low-cloud",
    title: "Low Cloud",
    width: 12, height: 9,
    medium: "Gouache on paper",
    image: stock(1051, 1200, 900),
    thumb: stock(1051, 600, 450),
    description:
      "Weather coming in low and fast. Painted quickly to keep up with a sky that wouldn't hold still.",
  },
  {
    id: "orchard",
    title: "Orchard",
    width: 20, height: 24,
    medium: "Oil on canvas",
    image: stock(1053, 1000, 1200),
    thumb: stock(1053, 500, 600),
    description:
      "Rows of trees in late summer, heavy and ordered. A piece about cultivation — nature arranged by a patient hand.",
  },
  {
    id: "back-road",
    title: "Back Road",
    width: 24, height: 20,
    medium: "Oil on canvas",
    image: stock(1054, 1200, 1000),
    thumb: stock(1054, 600, 500),
    description:
      "The kind of road you only find by getting lost. Gravel, ditch, and a horizon that keeps its distance.",
  },
  {
    id: "noon",
    title: "Noon",
    width: 16, height: 16,
    medium: "Acrylic on panel",
    image: stock(1056, 1100, 1100),
    thumb: stock(1056, 520, 520),
    description:
      "The flattest light of the day, when shadows disappear and everything is stated plainly. A square with nowhere to hide.",
  },
  {
    id: "the-tall-tale",
    title: "The Tall Tale",
    width: 36, height: 48,
    medium: "Oil on canvas",
    image: stock(1057, 1050, 1400),
    thumb: stock(1057, 450, 600),
    description:
      "A large vertical canvas with room to exaggerate. The composition stretches its subject taller than life and dares you to disbelieve it.",
  },
  {
    id: "broad-daylight",
    title: "Broad Daylight",
    width: 50, height: 40,
    medium: "Oil on canvas",
    image: stock(1059, 1400, 1120),
    thumb: stock(1059, 600, 480),
    description:
      "A big, bright landscape that refuses to be subtle about the sun. Confident colour, generous scale.",
  },
  {
    id: "first-frost",
    title: "First Frost",
    width: 40, height: 50,
    medium: "Oil on canvas",
    image: stock(1060, 1120, 1400),
    thumb: stock(1060, 480, 600),
    description:
      "The morning the season turns. Cool whites laid over the warm ground of autumn, the two seasons briefly sharing the canvas.",
  },
  {
    id: "matchbook",
    title: "Matchbook",
    width: 8, height: 10,
    medium: "Oil on panel",
    image: stock(1061, 960, 1200),
    thumb: stock(1061, 480, 600),
    description:
      "The smallest oil in the collection — pocket-sized and precise. A reminder that intimacy is its own kind of scale.",
  },
  {
    id: "two-by-four",
    title: "Two by Four",
    width: 10, height: 8,
    medium: "Oil on panel",
    image: stock(1062, 1200, 960),
    thumb: stock(1062, 600, 480),
    description:
      "A little landscape with a builder's name. Small, sturdy, and completely sure of itself.",
  },
  {
    id: "headland",
    title: "Headland",
    width: 30, height: 24,
    medium: "Oil on canvas",
    image: stock(1063, 1200, 960),
    thumb: stock(1063, 600, 480),
    description:
      "Where the land runs out and decides to become cliff. Painted from below, looking up at rock that has been patient for a very long time.",
  },
  {
    id: "the-long-vertical",
    title: "The Long Vertical",
    width: 18, height: 36,
    medium: "Acrylic on canvas",
    image: stock(1064, 700, 1400),
    thumb: stock(1064, 350, 700),
    description:
      "A narrow column of a painting. Half landscape, half abstraction — a strip of the world stood on its end.",
  },
  {
    id: "wide-awake",
    title: "Wide Awake",
    width: 36, height: 18,
    medium: "Acrylic on canvas",
    image: stock(1067, 1400, 700),
    thumb: stock(1067, 700, 350),
    description:
      "A horizontal banner of colour, alert and stretched out across the wall. The piece that closes the collection on a wide, open note.",
  },
];

// Make the data available to the page scripts (and ignore in non-browser ctx).
if (typeof window !== "undefined") {
  window.ARTWORKS = ARTWORKS;
}
