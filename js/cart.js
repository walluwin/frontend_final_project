/* ==========================================================================
   Cart page: list of chosen artworks, license choice (personal/commercial),
   order summary and a validated checkout form. Orders are saved to the
   user's profile when they are logged in.
   ========================================================================== */

const cartList = document.getElementById("cartList");
const checkoutForm = document.getElementById("checkoutForm");
const validateCheckout = setupValidation(checkoutForm);
const PROMO_CODES = { ART10: 0.1, AITU15: 0.15 };
let discount = 0;

function getLinePrice(item) {
  const product = getProductById(item.id);
  return product.price * LICENSES[item.license].multiplier;
}

function renderCart() {
  const cart = getCart().filter((item) => getProductById(item.id)); // ignore removed products

  if (!cart.length) {
    cartList.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-bag"></i>
        <h3>Your cart is empty</h3>
        <p>Find something you love in the shop.</p>
        <a class="btn btn-primary" href="shop.html">Go to shop <i class="bi bi-arrow-right"></i></a>
      </div>`;
  } else {
    cartList.innerHTML = cart.map((item) => {
      const product = getProductById(item.id);
      const options = Object.entries(LICENSES)
        .map(([key, license]) => `<option value="${key}" ${item.license === key ? "selected" : ""}>${license.label}</option>`)
        .join("");
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${escapeHTML(product.title)}">
          <div>
            <h3>${escapeHTML(product.title)}</h3>
            <p class="muted" style="margin:0 0 8px">by ${escapeHTML(product.artist)} · <strong>${formatPrice(getLinePrice(item))}</strong></p>
            <label class="visually-hidden" for="license-${product.id}">License for ${escapeHTML(product.title)}</label>
            <select class="select license-select" id="license-${product.id}" data-id="${product.id}">${options}</select>
          </div>
          <button class="icon-btn remove-btn" data-id="${product.id}" aria-label="Remove ${escapeHTML(product.title)}">
            <i class="bi bi-trash3"></i>
          </button>
        </div>`;
    }).join("");
  }

  renderSummary(cart);
}

function renderSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + getLinePrice(item), 0);
  const discountValue = subtotal * discount;
  document.getElementById("sumItems").textContent = cart.length;
  document.getElementById("sumSubtotal").textContent = formatPrice(subtotal);
  document.getElementById("sumDiscount").textContent = `−${formatPrice(discountValue)}`;
  document.getElementById("sumTotal").textContent = formatPrice(subtotal - discountValue);
  checkoutForm.querySelector("button[type=submit]").disabled = cart.length === 0;
}

/* ---------- Cart events ---------- */
cartList.addEventListener("change", (event) => {
  if (!event.target.matches(".license-select")) return;
  const cart = getCart().map((item) =>
    item.id === event.target.dataset.id ? { ...item, license: event.target.value } : item
  );
  saveCart(cart);
  renderCart();
});

cartList.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-btn");
  if (!button) return;
  const product = getProductById(button.dataset.id);
  saveCart(getCart().filter((item) => item.id !== button.dataset.id));
  renderCart();
  showToast(`"${product.title}" removed`, "bi-trash3");
});

/* ---------- Promo code ---------- */
document.getElementById("promoButton").addEventListener("click", () => {
  const input = document.getElementById("promoInput");
  const code = input.value.trim().toUpperCase();
  if (!code) {
    setFieldError(input, "Enter a promo code first.");
  } else if (PROMO_CODES[code]) {
    discount = PROMO_CODES[code];
    setFieldError(input, "");
    showToast(`Promo applied: −${discount * 100}%`, "bi-percent");
    renderCart();
  } else {
    discount = 0;
    setFieldError(input, "This promo code is not valid. Try ART10.");
    renderCart();
  }
});

/* ---------- Checkout ---------- */
// Pre-fill the form for logged-in users
const loggedUser = getCurrentUser();
if (loggedUser) {
  checkoutForm.fullName.value = loggedUser.name;
  checkoutForm.email.value = loggedUser.email;
  checkoutForm.phone.value = loggedUser.phone;
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hideFormAlert(checkoutForm);
  const cart = getCart();
  if (!cart.length || !validateCheckout()) return;

  const subtotal = cart.reduce((sum, item) => sum + getLinePrice(item), 0);
  const order = {
    id: Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    items: cart.map((item) => ({ id: item.id, title: getProductById(item.id).title, license: item.license })),
    total: Math.round(subtotal * (1 - discount) * 100) / 100
  };

  if (getCurrentUser()) {
    const user = getCurrentUser();
    updateCurrentUser({ orders: [...(user.orders || []), order] });
  }

  saveCart([]);
  discount = 0;
  renderCart();
  const email = escapeHTML(checkoutForm.email.value.trim());
  resetForm(checkoutForm);
  showFormAlert(
    checkoutForm,
    `Order #${order.id} confirmed! Download links were sent to ${email}.` +
      (getCurrentUser() ? ' See it in your <a href="profile.html">profile</a>.' : ""),
    "success"
  );
});

renderCart();
