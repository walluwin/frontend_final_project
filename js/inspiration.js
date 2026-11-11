/* ==========================================================================
   Inspiration page — External API integration.
   Uses the free Cleveland Museum of Art Open Access API (no key needed):
   https://openaccess-api.clevelandart.org/
   Shows a loading state (skeletons), handles errors with a retry button,
   supports "Load more" pagination and remembers recent searches.
   ========================================================================== */

const API_BASE = "https://openaccess-api.clevelandart.org/api/artworks/";
const API_FIELDS = "id,title,creation_date,creators,technique,culture,url,images";
const PAGE_SIZE = 12;
const MAX_RECENT = 6;

const apiForm = document.getElementById("apiSearchForm");
const apiInput = document.getElementById("apiQuery");
const apiGrid = document.getElementById("apiGrid");
const apiStatus = document.getElementById("apiStatus");
const loadMoreButton = document.getElementById("loadMore");
const recentBox = document.getElementById("recentSearches");
const quickTopics = document.getElementById("quickTopics");
const validateApiForm = setupValidation(apiForm);

let currentQuery = "";
let currentPage = 1;
let totalPages = 1;

/* ---------- API request ---------- */
async function fetchArtworks(query, page) {
  const params = new URLSearchParams({
    q: query,
    skip: String((page - 1) * PAGE_SIZE), // the API uses skip/limit for pagination
    limit: String(PAGE_SIZE),
    fields: API_FIELDS,
    has_image: "1", // only artworks that have a photo
    cc0: "1"        // only public-domain (CC0) works that are free to display
  });

  const response = await fetch(`${API_BASE}?${params}`);
  if (!response.ok) throw new Error(`Server responded with status ${response.status}`);
  return response.json();
}

/* Artist name without the "(Dutch, 1853–1890)" part */
function getArtistName(art) {
  const creator = art.creators && art.creators[0];
  return creator ? creator.description.split(" (")[0] : "Unknown artist";
}

/* ---------- Rendering ---------- */
function showSkeletons() {
  apiGrid.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton" aria-hidden="true"></div>').join("");
}

function renderArtworks(data, append) {
  const withImages = data.data.filter((art) => art.images && art.images.web);
  if (!append) apiGrid.innerHTML = "";

  if (!withImages.length && !append) {
    apiGrid.innerHTML = `
      <div class="status-box">
        <i class="bi bi-image"></i>
        <strong>Nothing found for "${escapeHTML(currentQuery)}".</strong>
        <p>Try a simpler word like "cat", "flowers" or "sea".</p>
      </div>`;
    return;
  }

  withImages.forEach((art) => {
    const card = document.createElement("article");
    card.className = "art-card api-card";
    card.innerHTML = `
      <div class="art-thumb">
        <img src="${art.images.web.url}" alt="${escapeHTML(art.title)}" loading="lazy">
        <span class="badge">${escapeHTML(art.creation_date || "Unknown date")}</span>
      </div>
      <div class="art-body">
        <h3>${escapeHTML(art.title)}</h3>
        <p>${escapeHTML(getArtistName(art))}</p>
        <p>${escapeHTML(art.technique || (art.culture && art.culture[0]) || "")}</p>
        <div class="art-foot">
          <a class="btn btn-outline btn-sm" href="${art.url}" target="_blank" rel="noopener">
            View at museum <i class="bi bi-box-arrow-up-right"></i>
          </a>
        </div>
      </div>`;
    // If one image fails to load, hide that card instead of showing a broken icon
    card.querySelector("img").addEventListener("error", () => card.remove());
    apiGrid.appendChild(card);
  });
}

function showError(message) {
  apiGrid.innerHTML = `
    <div class="status-box error" role="alert">
      <i class="bi bi-wifi-off"></i>
      <strong>Could not load artworks.</strong>
      <p>${escapeHTML(message)}. Check your internet connection and try again.</p>
      <button class="btn btn-primary btn-sm" id="retryButton"><i class="bi bi-arrow-clockwise"></i> Try again</button>
    </div>`;
  document.getElementById("retryButton").addEventListener("click", () => search(currentQuery));
}

/* ---------- Search flow ---------- */
async function search(query, append = false) {
  currentQuery = query;
  if (!append) {
    currentPage = 1;
    showSkeletons();
    apiStatus.textContent = `Searching for "${query}"…`;
  }

  loadMoreButton.hidden = true;
  setLoadingButton(true);

  try {
    const data = await fetchArtworks(query, currentPage);
    totalPages = Math.ceil(data.info.total / PAGE_SIZE);
    renderArtworks(data, append);
    apiStatus.textContent = `${data.info.total.toLocaleString("en-US")} public-domain artworks found for "${query}"`;
    loadMoreButton.hidden = currentPage >= totalPages;
    if (!append && data.info.total > 0) saveRecentSearch(query); // don't remember searches with no results
  } catch (error) {
    apiStatus.textContent = "";
    showError(error.message);
  } finally {
    setLoadingButton(false);
  }
}

function setLoadingButton(isLoading) {
  const submit = apiForm.querySelector("button[type=submit]");
  submit.disabled = isLoading;
  submit.innerHTML = isLoading ? '<span class="spinner"></span> Loading' : '<i class="bi bi-search"></i> Search';
  loadMoreButton.disabled = isLoading;
}

/* ---------- Recent searches (localStorage) ---------- */
function getRecentSearches() {
  return readStorage(STORAGE_KEYS.artSearch, []);
}

function saveRecentSearch(query) {
  const normalized = query.toLowerCase();
  const recent = getRecentSearches().filter((item) => item !== normalized);
  recent.unshift(normalized);
  writeStorage(STORAGE_KEYS.artSearch, recent.slice(0, MAX_RECENT));
  renderRecent();
}

function renderRecent() {
  const recent = getRecentSearches();
  if (!recent.length) {
    recentBox.innerHTML = "";
    return;
  }
  recentBox.innerHTML = `
    <span><i class="bi bi-clock-history"></i> Recent:</span>
    ${recent.map((item) => `<button class="chip" data-query="${escapeHTML(item)}">${escapeHTML(item)}</button>`).join("")}
    <button class="chip" id="clearRecent" aria-label="Clear recent searches"><i class="bi bi-x-lg"></i> Clear</button>`;
}

/* ---------- Events ---------- */
apiForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateApiForm()) return;
  search(apiInput.value.trim());
});

loadMoreButton.addEventListener("click", () => {
  currentPage += 1;
  search(currentQuery, true);
});

function runChipSearch(event) {
  const chip = event.target.closest("[data-query]");
  if (!chip) return;
  apiInput.value = chip.dataset.query;
  clearFieldState(apiInput);
  search(chip.dataset.query);
}

quickTopics.addEventListener("click", runChipSearch);
recentBox.addEventListener("click", (event) => {
  if (event.target.closest("#clearRecent")) {
    writeStorage(STORAGE_KEYS.artSearch, []);
    renderRecent();
    return;
  }
  runChipSearch(event);
});

/* ---------- Start: show the last search, or a default topic ---------- */
renderRecent();
const startQuery = getRecentSearches()[0] || "landscape";
apiInput.value = startQuery;
search(startQuery);
