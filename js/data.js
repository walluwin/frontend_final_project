/* ==========================================================================
   Product catalogue for ArtNova.
   In a real store this would come from a backend; here it is a static list.
   ========================================================================== */

const CATEGORIES = [
  { id: "abstract", name: "Abstract", image: "images/neon-dreams.jpg" },
  { id: "geometric", name: "Geometric", image: "images/bauhaus-grid.jpg" },
  { id: "waves", name: "Waves & Flow", image: "images/ocean-layers.jpg" },
  { id: "space", name: "Space", image: "images/saturn-dream.jpg" },
  { id: "retro", name: "Retro", image: "images/retro-sunset.jpg" },
  { id: "pixel", name: "Pixel Art", image: "images/pixel-spirit.jpg" }
];

const PRODUCTS = [
  {
    id: "neon-dreams", title: "Neon Dreams", artist: "Mira Solenne", category: "abstract",
    price: 39, rating: 4.9, sales: 412, added: "2026-10-02", image: "images/neon-dreams.jpg",
    tags: ["neon", "glow", "purple", "night"],
    description: "Soft glowing color clouds that look great as a desktop wallpaper or a large canvas print."
  },
  {
    id: "soft-bloom", title: "Soft Bloom", artist: "Lena Voss", category: "abstract",
    price: 24, rating: 4.6, sales: 198, added: "2026-08-14", image: "images/soft-bloom.jpg",
    tags: ["pastel", "calm", "pink", "minimal"],
    description: "A calm pastel composition made for bedrooms, studios and mindful workspaces."
  },
  {
    id: "bauhaus-grid", title: "Bauhaus Grid", artist: "Timur Askar", category: "geometric",
    price: 45, rating: 4.8, sales: 305, added: "2026-09-21", image: "images/bauhaus-grid.jpg",
    tags: ["bauhaus", "shapes", "red", "poster"],
    description: "A tribute to the Bauhaus school: bold primary colors and simple shapes on a 6×6 grid."
  },
  {
    id: "mint-shapes", title: "Mint Shapes", artist: "Saya Ito", category: "geometric",
    price: 19, rating: 4.4, sales: 156, added: "2026-06-30", image: "images/mint-shapes.jpg",
    tags: ["mint", "pattern", "teal", "modern"],
    description: "Fresh teal and mustard tones that work well as a repeating pattern or a phone wallpaper."
  },
  {
    id: "ocean-layers", title: "Ocean Layers", artist: "Kai Nurlan", category: "waves",
    price: 32, rating: 4.7, sales: 267, added: "2026-10-18", image: "images/ocean-layers.jpg",
    tags: ["ocean", "blue", "calm", "nature"],
    description: "Seven layers of rolling waves, from sandy morning light down to the deep blue sea."
  },
  {
    id: "dune-rhythm", title: "Dune Rhythm", artist: "Omar Reyes", category: "waves",
    price: 28, rating: 4.5, sales: 121, added: "2026-07-09", image: "images/dune-rhythm.jpg",
    tags: ["desert", "warm", "orange", "sunset"],
    description: "Warm terracotta dunes moving in rhythm. Ideal for cozy living rooms."
  },
  {
    id: "saturn-dream", title: "Saturn Dream", artist: "Mira Solenne", category: "space",
    price: 55, rating: 5.0, sales: 488, added: "2026-11-01", image: "images/saturn-dream.jpg",
    tags: ["planet", "stars", "cosmos", "night"],
    description: "Our best-seller: a ringed planet floating among hundreds of stars. Available in 8K."
  },
  {
    id: "violet-orbit", title: "Violet Orbit", artist: "Kai Nurlan", category: "space",
    price: 49, rating: 4.7, sales: 233, added: "2026-09-05", image: "images/violet-orbit.jpg",
    tags: ["planet", "neon", "cosmos", "blue"],
    description: "A cool-toned cosmic scene with a glowing pink ring and a distant moon."
  },
  {
    id: "retro-sunset", title: "Retro Sunset", artist: "Lena Voss", category: "retro",
    price: 35, rating: 4.8, sales: 352, added: "2026-08-27", image: "images/retro-sunset.jpg",
    tags: ["synthwave", "80s", "sunset", "mountains"],
    description: "Synthwave-style sunset with a striped sun and layered purple mountains."
  },
  {
    id: "desert-dusk", title: "Desert Dusk", artist: "Omar Reyes", category: "retro",
    price: 22, rating: 4.3, sales: 94, added: "2026-05-12", image: "images/desert-dusk.jpg",
    tags: ["desert", "sunset", "vintage", "warm"],
    description: "Vintage travel-poster mood: a golden sun sinking behind dark desert ridges."
  },
  {
    id: "pixel-spirit", title: "Pixel Spirit", artist: "Saya Ito", category: "pixel",
    price: 15, rating: 4.6, sales: 211, added: "2026-10-25", image: "images/pixel-spirit.jpg",
    tags: ["8-bit", "game", "neon", "symmetry"],
    description: "A symmetric 16×16 pixel creature. Perfect for avatars and gaming setups."
  },
  {
    id: "forest-sprite", title: "Forest Sprite", artist: "Timur Askar", category: "pixel",
    price: 12, rating: 4.2, sales: 87, added: "2026-04-03", image: "images/forest-sprite.jpg",
    tags: ["8-bit", "green", "nature", "game"],
    description: "A small green pixel spirit of the forest, generated from a mirrored random grid."
  }
];

/* License options and price multipliers, used in the cart */
const LICENSES = {
  personal: { label: "Personal use", multiplier: 1 },
  commercial: { label: "Commercial use", multiplier: 2.5 }
};

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function getCategoryName(id) {
  const category = CATEGORIES.find((cat) => cat.id === id);
  return category ? category.name : id;
}
