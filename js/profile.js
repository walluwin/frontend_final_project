/* ==========================================================================
   Profile page: shows the logged-in user's stored details, favorites and
   order history. Visitors who are not logged in are sent to login.html.
   ========================================================================== */

const user = getCurrentUser();

if (!user) {
  window.location.replace("login.html");
} else {
  renderProfile();
}

function getInitials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function renderProfile() {
  document.getElementById("profileAvatar").textContent = getInitials(user.name);
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmailHead").textContent = user.email;
  document.getElementById("infoName").textContent = user.name;
  document.getElementById("infoEmail").textContent = user.email;
  document.getElementById("infoPhone").textContent = user.phone;
  document.getElementById("infoSince").textContent = formatDate(user.createdAt);

  const orders = user.orders || [];
  const favorites = getFavorites();
  const spent = orders.reduce((sum, order) => sum + order.total, 0);

  document.getElementById("statOrders").textContent = orders.length;
  document.getElementById("statFavs").textContent = favorites.length;
  document.getElementById("statSpent").textContent = formatPrice(spent);

  renderFavorites();
  renderOrders(orders);
}

function renderFavorites() {
  const grid = document.getElementById("favGrid");
  const favorites = getFavorites().map(getProductById).filter(Boolean);
  grid.innerHTML = "";

  if (!favorites.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-heart"></i>
        <p>You have no favorites yet. Tap the heart on any artwork to save it here.</p>
        <a class="btn btn-primary" href="shop.html">Browse the shop <i class="bi bi-arrow-right"></i></a>
      </div>`;
    return;
  }
  favorites.forEach((product) => grid.appendChild(createArtCard(product)));
}

function renderOrders(orders) {
  const list = document.getElementById("orderList");
  if (!orders.length) {
    list.innerHTML = '<p class="muted">No orders yet. Your purchased artworks will appear here.</p>';
    return;
  }
  list.innerHTML = [...orders].reverse().map((order) => `
    <div class="order">
      <div class="order-top">
        <span>Order #${order.id}</span>
        <span>${formatPrice(order.total)}</span>
      </div>
      <p class="muted" style="margin:4px 0 0">
        ${formatDate(order.date)} · ${order.items.map((item) => escapeHTML(item.title)).join(", ")}
      </p>
    </div>`).join("");
}

if (user) {
  // Removing a favorite on this page should also remove the card and update the counter
  bindCardActions(document.getElementById("favGrid"), {
    onFavChange: () => {
      renderFavorites();
      document.getElementById("statFavs").textContent = getFavorites().length;
    }
  });

  document.getElementById("logoutButton").addEventListener("click", logout);
}
