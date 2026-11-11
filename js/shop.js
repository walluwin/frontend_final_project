/* ==========================================================================
   Shop page: search, category filter, price filter, sorting, favorites-only,
   quick-view modal. The chosen filters are saved in localStorage, so the
   shop looks the same when the user comes back.
   ========================================================================== */

const DEFAULT_FILTERS = { search: "", category: "all", price: "any", sort: "popular", favOnly: false };

const shopGrid = document.getElementById("shopGrid");
const searchInput = document.getElementById("searchInput");
const categoryChips = document.getElementById("categoryChips");
const priceFilter = document.getElementById("priceFilter");
const sortSelect = document.getElementById("sortSelect");
const favOnlyButton = document.getElementById("favOnly");
const resultCount = document.getElementById("resultCount");
const resetButton = document.getElementById("resetFilters");
const modal = document.getElementById("quickView");

let filters = { ...DEFAULT_FILTERS, ...readStorage(STORAGE_KEYS.shopFilters, {}) };

// A link like shop.html?category=space (from the home page) overrides the saved category
const urlCategory = new URLSearchParams(window.location.search).get("category");
if (urlCategory && CATEGORIES.some((cat) => cat.id === urlCategory)) {
  filters.category = urlCategory;
}

/* ---------- Build category chips ---------- */
function renderChips() {
  const all = [{ id: "all", name: "All" }, ...CATEGORIES];
  categoryChips.innerHTML = all
    .map((cat) => `<button class="chip ${filters.category === cat.id ? "active" : ""}" data-category="${cat.id}"
        aria-pressed="${filters.category === cat.id}">${cat.name}</button>`)
    .join("");
}

/* ---------- Filtering + sorting ---------- */
function matchesPrice(price) {
  switch (filters.price) {
    case "under20": return price < 20;
    case "20to40": return price >= 20 && price <= 40;
    case "over40": return price > 40;
    default: return true;
  }
}

function getFilteredProducts() {
  const query = filters.search.trim().toLowerCase();
  const favorites = getFavorites();

  const list = PRODUCTS.filter((product) => {
    // search looks in title, artist and tags
    const haystack = [product.title, product.artist, ...product.tags].join(" ").toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (filters.category === "all" || product.category === filters.category) &&
      matchesPrice(product.price) &&
      (!filters.favOnly || favorites.includes(product.id))
    );
  });

  const sorters = {
    popular: (a, b) => b.sales - a.sales,
    newest: (a, b) => new Date(b.added) - new Date(a.added),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating
  };
  return list.sort(sorters[filters.sort] || sorters.popular);
}

function renderProducts() {
  const products = getFilteredProducts();
  shopGrid.innerHTML = "";

  if (products.length === 0) {
    shopGrid.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-search-heart"></i>
        <h3>No artworks found</h3>
        <p>Try another search word or reset the filters.</p>
        <button class="btn btn-outline" id="emptyReset"><i class="bi bi-arrow-counterclockwise"></i> Reset filters</button>
      </div>`;
    document.getElementById("emptyReset").addEventListener("click", resetFilters);
  } else {
    products.forEach((product) => shopGrid.appendChild(createArtCard(product)));
  }

  resultCount.textContent = `${products.length} of ${PRODUCTS.length} artworks`;
  writeStorage(STORAGE_KEYS.shopFilters, filters); // remember the user's choice
}

/* Puts saved filter values back into the controls */
function syncControls() {
  searchInput.value = filters.search;
  priceFilter.value = filters.price;
  sortSelect.value = filters.sort;
  favOnlyButton.classList.toggle("active", filters.favOnly);
  favOnlyButton.setAttribute("aria-pressed", String(filters.favOnly));
  renderChips();
}

function resetFilters() {
  filters = { ...DEFAULT_FILTERS };
  syncControls();
  renderProducts();
  showToast("Filters reset", "bi-arrow-counterclockwise");
}

/* ---------- Quick view modal ---------- */
function openQuickView(id) {
  const product = getProductById(id);
  modal.querySelector("img").src = product.image;
  modal.querySelector("img").alt = `${product.title} by ${product.artist}`;
  modal.querySelector("#qvCategory").textContent = getCategoryName(product.category);
  modal.querySelector("#qvTitle").textContent = product.title;
  modal.querySelector("#qvArtist").textContent = `by ${product.artist}`;
  modal.querySelector("#qvRating").innerHTML = `<i class="bi bi-star-fill"></i> ${product.rating.toFixed(1)} · ${product.sales} sold`;
  modal.querySelector("#qvDesc").textContent = product.description;
  modal.querySelector("#qvTags").innerHTML = product.tags.map((tag) => `<span class="tag">#${tag}</span>`).join("");
  modal.querySelector("#qvPrice").textContent = `$${product.price}`;
  modal.querySelector("#qvAdd").dataset.id = product.id;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal-close").focus();
}

function closeQuickView() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

/* ---------- Events ---------- */
let searchTimer;
searchInput.addEventListener("input", () => {
  // small delay (debounce) so we don't re-render on every single key press
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    filters.search = searchInput.value;
    renderProducts();
  }, 200);
});

categoryChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  filters.category = chip.dataset.category;
  renderChips();
  renderProducts();
});

priceFilter.addEventListener("change", () => { filters.price = priceFilter.value; renderProducts(); });
sortSelect.addEventListener("change", () => { filters.sort = sortSelect.value; renderProducts(); });

favOnlyButton.addEventListener("click", () => {
  filters.favOnly = !filters.favOnly;
  syncControls();
  renderProducts();
});

resetButton.addEventListener("click", resetFilters);

bindCardActions(shopGrid, {
  onView: openQuickView,
  onFavChange: () => { if (filters.favOnly) renderProducts(); }
});

modal.addEventListener("click", (event) => {
  if (event.target === modal || event.target.closest(".modal-close")) closeQuickView();
});
modal.querySelector("#qvAdd").addEventListener("click", (event) => addToCart(event.currentTarget.dataset.id));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeQuickView();
});

/* ---------- Start ---------- */
syncControls();
renderProducts();
