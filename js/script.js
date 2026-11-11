/* ==========================================================================
   ArtNova — shared script, loaded on every page.
   Handles: localStorage helpers, light/dark theme, mobile menu,
   header state (login / cart counter), toasts, favorites, cart,
   reusable product cards and scroll-reveal animations.
   ========================================================================== */

/* ---------- localStorage keys (one place, so names never drift) ---------- */
const STORAGE_KEYS = {
  theme: "artnova-theme",
  users: "artnova-users",
  session: "artnova-session",
  cart: "artnova-cart",
  favorites: "artnova-favorites",
  shopFilters: "artnova-shop-filters",
  artSearch: "artnova-art-search"
};

/* Safe JSON read/write: localStorage can be blocked (private mode) or hold bad data */
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save to localStorage:", error);
  }
}

/* ---------- Users & session (authentication simulation) ---------- */
function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
}

/* Returns the full user object of whoever is logged in, or null */
function getCurrentUser() {
  const email = readStorage(STORAGE_KEYS.session, null);
  if (!email) return null;
  return getUsers().find((user) => user.email === email) || null;
}

/* Saves changes to the logged-in user (e.g. a new order) */
function updateCurrentUser(changes) {
  const current = getCurrentUser();
  if (!current) return;
  const users = getUsers().map((user) => (user.email === current.email ? { ...user, ...changes } : user));
  saveUsers(users);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.session);
  window.location.href = "login.html";
}

/* ---------- Theme (light / dark) ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.querySelector(".theme-toggle i");
  if (icon) icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
  const toggle = document.querySelector(".theme-toggle");
  if (toggle) toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}

function initTheme() {
  // Saved choice wins; otherwise follow the operating system setting
  const saved = readStorage(STORAGE_KEYS.theme, null);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    writeStorage(STORAGE_KEYS.theme, next);
    // replay the spin animation on every click
    toggle.classList.remove("spin");
    void toggle.offsetWidth;
    toggle.classList.add("spin");
  });
}

/* ---------- Navigation ---------- */
function initNavigation() {
  // Highlight the link of the current page
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  // Mobile burger menu
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (!menuButton || !nav) return;

  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.querySelector("i").className = isOpen ? "bi bi-x-lg" : "bi bi-list";
  });

  // Close the menu after choosing a link
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.querySelector("i").className = "bi bi-list";
    })
  );
}

/* Shows "Log in" or the user's first name in the header */
function updateAuthLink() {
  const link = document.querySelector(".login-link");
  if (!link) return;
  const user = getCurrentUser();
  if (user) {
    link.href = "profile.html";
    link.innerHTML = `<i class="bi bi-person-check"></i><span>${escapeHTML(user.name.split(" ")[0])}</span>`;
  } else {
    link.href = "login.html";
    link.innerHTML = `<i class="bi bi-person"></i><span>Log in</span>`;
  }
}

/* ---------- Toast notifications ---------- */
function showToast(message, icon = "bi-check-circle") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    wrap.setAttribute("aria-live", "polite");
    document.body.appendChild(wrap);
  }
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<i class="bi ${icon}"></i><span>${escapeHTML(message)}</span>`;
  wrap.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("hide");
    toast.addEventListener("animationend", () => toast.remove());
  }, 2600);
}

/* ---------- Favorites ---------- */
function getFavorites() {
  return readStorage(STORAGE_KEYS.favorites, []);
}

function toggleFavorite(productId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(productId);
  if (index === -1) favorites.push(productId);
  else favorites.splice(index, 1);
  writeStorage(STORAGE_KEYS.favorites, favorites);
  return index === -1; // true = now favorited
}

/* ---------- Cart ---------- */
// Cart item shape: { id: "neon-dreams", license: "personal" }
function getCart() {
  return readStorage(STORAGE_KEYS.cart, []);
}

function saveCart(cart) {
  writeStorage(STORAGE_KEYS.cart, cart);
  updateCartCount();
}

function addToCart(productId) {
  const cart = getCart();
  const product = getProductById(productId);
  if (cart.some((item) => item.id === productId)) {
    showToast(`"${product.title}" is already in your cart`, "bi-info-circle");
    return;
  }
  cart.push({ id: productId, license: "personal" });
  saveCart(cart);
  showToast(`"${product.title}" added to cart`, "bi-bag-check");
}

function updateCartCount() {
  const badge = document.querySelector(".cart-count");
  if (!badge) return;
  const count = getCart().length;
  badge.textContent = count;
  badge.dataset.count = count;
}

/* ---------- Reusable product card ---------- */
function createArtCard(product) {
  const isFav = getFavorites().includes(product.id);
  const card = document.createElement("article");
  card.className = "art-card";
  card.innerHTML = `
    <div class="art-thumb" data-action="view" data-id="${product.id}">
      <img src="${product.image}" alt="${escapeHTML(product.title)} by ${escapeHTML(product.artist)}" loading="lazy">
      <span class="badge">${getCategoryName(product.category)}</span>
      <button class="fav-btn ${isFav ? "active" : ""}" data-action="fav" data-id="${product.id}"
        aria-label="${isFav ? "Remove from" : "Add to"} favorites" aria-pressed="${isFav}">
        <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
      </button>
    </div>
    <div class="art-body">
      <h3>${escapeHTML(product.title)}</h3>
      <div class="art-meta">
        <span>by ${escapeHTML(product.artist)}</span>
        <span class="rating"><i class="bi bi-star-fill"></i> ${product.rating.toFixed(1)}</span>
      </div>
      <div class="art-foot">
        <span class="price">$${product.price}</span>
        <button class="btn btn-primary btn-sm" data-action="cart" data-id="${product.id}">
          <i class="bi bi-bag-plus"></i> Add to cart
        </button>
      </div>
    </div>`;
  return card;
}

/*
 * One delegated click handler for any grid of product cards.
 * onView (optional) is called when the image is clicked (quick view modal).
 * onFavChange (optional) lets a page re-render, e.g. the "favorites only" filter.
 */
function bindCardActions(container, { onView, onFavChange } = {}) {
  container.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const id = target.dataset.id;
    const action = target.dataset.action;

    if (action === "fav") {
      event.stopPropagation();
      const nowFav = toggleFavorite(id);
      target.classList.toggle("active", nowFav);
      target.setAttribute("aria-pressed", String(nowFav));
      target.setAttribute("aria-label", `${nowFav ? "Remove from" : "Add to"} favorites`);
      target.querySelector("i").className = `bi ${nowFav ? "bi-heart-fill" : "bi-heart"}`;
      showToast(nowFav ? "Saved to favorites" : "Removed from favorites", nowFav ? "bi-heart-fill" : "bi-heart");
      if (onFavChange) onFavChange();
    } else if (action === "cart") {
      addToCart(id);
    } else if (action === "view" && onView) {
      onView(id);
    }
  });
}

/* ---------- Scroll reveal animation ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------- Small utilities ---------- */
// Prevents user-typed text from being interpreted as HTML (XSS protection)
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* Password show/hide buttons on auth forms */
function initPasswordToggles() {
  document.querySelectorAll(".toggle-pass").forEach((button) => {
    button.addEventListener("click", () => {
      const input = button.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.querySelector("i").className = show ? "bi bi-eye-slash" : "bi bi-eye";
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  updateAuthLink();
  updateCartCount();
  initPasswordToggles();
  initReveal();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
