/* ==========================================================================
   Home page: category tiles, top-rated artworks and the newsletter form.
   ========================================================================== */

/* Category tiles link to the shop with a pre-selected category */
const categoryGrid = document.getElementById("categoryGrid");
categoryGrid.innerHTML = CATEGORIES.map((cat) => {
  const count = PRODUCTS.filter((product) => product.category === cat.id).length;
  return `
    <a class="cat-tile reveal" href="shop.html?category=${cat.id}">
      <img src="${cat.image}" alt="${cat.name} artwork example" loading="lazy">
      <span>${cat.name}<small>${count} artworks</small></span>
    </a>`;
}).join("");

/* Featured = 4 best-rated artworks */
const featuredGrid = document.getElementById("featuredGrid");
[...PRODUCTS]
  .sort((a, b) => b.rating - a.rating || b.sales - a.sales)
  .slice(0, 4)
  .forEach((product) => featuredGrid.appendChild(createArtCard(product)));

// Clicking a featured image opens the shop (quick view lives there)
bindCardActions(featuredGrid, { onView: () => { window.location.href = "shop.html"; } });

/* Newsletter subscription (validated, stored locally) */
const newsletterForm = document.getElementById("newsletterForm");
const validateNewsletter = setupValidation(newsletterForm);

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateNewsletter()) return;

  const email = newsletterForm.email.value.trim().toLowerCase();
  const subscribers = readStorage("artnova-subscribers", []);
  if (!subscribers.includes(email)) {
    subscribers.push(email);
    writeStorage("artnova-subscribers", subscribers);
  }
  resetForm(newsletterForm);
  showFormAlert(newsletterForm, "Thanks! New drops will arrive in your inbox every Friday.", "success");
});
