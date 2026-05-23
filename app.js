const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const defaultCategories = ["Cocktails", "Coffee", "Starters", "Main Course", "Desserts", "Party Platters"];
const daypartLabels = {
  breakfast: "Breakfast rooftop menu",
  evening: "Evening cafe menu",
  night: "Night lounge menu",
};

const config = window.RAASTA_CONFIG || {};
const apiBaseUrl = (localStorage.getItem("RAASTA_API_BASE_URL") || config.API_BASE_URL || "").replace(/\/$/, "");

const state = {
  activeCategory: "Cocktails",
  activePeriod: "evening",
  categories: defaultCategories,
  menu: [],
  session: null,
  guest: null,
  cart: null,
  selectedItem: null,
  selectedQty: 1,
  selectedModifiers: new Map(),
  pendingJoinRequest: null,
  lastOrder: null,
};

const appShell = document.querySelector(".app-shell");
const splash = document.querySelector("#splash");
const entryForm = document.querySelector("#entryForm");
const entry = document.querySelector("#entry");
const orderingView = document.querySelector("#orderingView");
const categoryTabs = document.querySelector("#categoryTabs");
const menuGrid = document.querySelector("#menuGrid");
const avatarRow = document.querySelector("#avatarRow");
const approveJoin = document.querySelector("#approveJoin");
const itemSheet = document.querySelector("#itemSheet");
const closeSheet = document.querySelector("#closeSheet");
const addToCart = document.querySelector("#addToCart");
const qtyMinus = document.querySelector("#qtyMinus");
const qtyPlus = document.querySelector("#qtyPlus");
const sendOrder = document.querySelector("#sendOrder");
const confirmation = document.querySelector("#confirmation");
const backToMenu = document.querySelector("#backToMenu");
const modifierGroups = document.querySelector("#modifierGroups");
const entryError = document.querySelector("#entryError");

window.addEventListener("load", () => {
  setTimeout(() => splash.classList.add("is-hidden"), 900);
});

function money(value = 0) {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function tableIdFromUrl() {
  const url = new URL(window.location.href);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const routeTableId = ["t", "table"].includes(pathParts[0]) ? pathParts[1] : null;
  return url.searchParams.get("tableId") || url.searchParams.get("table") || routeTableId || "R07";
}

function displayTableId(tableId) {
  if (!tableId) return "R-07";
  return tableId.includes("-") ? tableId : tableId.replace(/^([A-Za-z]+)(\d+)$/, "$1-$2");
}

function titleCase(value) {
  return value
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function setTableLabels(tableId, zoneId = "sky-terrace") {
  const zoneLabel = titleCase(zoneId);
  const tableLabel = `Table ${displayTableId(tableId)}`;
  document.querySelector(".table-pill strong").textContent = tableLabel;
  document.querySelector(".table-pill span").textContent = zoneLabel;
  document.querySelector(".session-hero h2").textContent = `${zoneLabel} ${displayTableId(tableId)}`;
}

async function api(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text.slice(0, 120) };
    }
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed: ${response.status}`);
  }

  return payload;
}

function showNotice(target, title, message) {
  target.innerHTML = `
    <div class="system-notice">
      <strong>${title}</strong>
      <p>${message}</p>
    </div>`;
}

function normalizeItem(item) {
  return {
    ...item,
    desc: item.description || item.desc || "",
    price: Number(item.price || 0),
    modifierGroups: item.modifierGroups || [],
  };
}

async function loadMenu(period = state.activePeriod) {
  try {
    showNotice(menuGrid, "Loading menu", "Fetching the live rooftop menu from backend.");
    const data = await api(`/api/menu?period=${encodeURIComponent(period)}`);
    state.activePeriod = data.period || period;
    state.categories = data.categories?.length ? data.categories : defaultCategories;
    state.menu = (data.items || []).map(normalizeItem);
    state.activeCategory = state.categories.includes(state.activeCategory) ? state.activeCategory : state.categories[0];
    document.querySelector("#daypartLabel").textContent = data.periodMeta?.label || daypartLabels[state.activePeriod] || "Live menu";
    renderCategories();
    renderMenu();
  } catch (error) {
    state.menu = [];
    renderCategories();
    showNotice(
      menuGrid,
      "Backend connection needed",
      `${error.message}. Set window.RAASTA_CONFIG.API_BASE_URL in config.js to your backend URL.`,
    );
  }
}

function renderCategories() {
  categoryTabs.innerHTML = state.categories
    .map(
      (category) =>
        `<button type="button" class="${category === state.activeCategory ? "active" : ""}" data-category="${category}">${category}</button>`,
    )
    .join("");
}

function renderMenu() {
  const items = state.menu.filter((item) => item.category === state.activeCategory);

  if (!items.length) {
    showNotice(menuGrid, "No items available", "The backend returned no items for this category or time period.");
    return;
  }

  menuGrid.innerHTML = items
    .map(
      (item, index) => `
        <article class="item-card" style="animation-delay:${index * 45}ms">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="item-info">
            <div>
              <div class="item-title-row">
                <h3>${item.name}</h3>
                <span class="food-mark ${item.veg ? "" : "nonveg"}" aria-label="${item.veg ? "Vegetarian" : "Non vegetarian"}"></span>
              </div>
              <p>${item.desc}</p>
            </div>
            <div class="item-meta">
              <span class="price">${money(item.price)}</span>
              <button class="add-button" type="button" data-item="${item.id}">Add</button>
            </div>
          </div>
        </article>`,
    )
    .join("");
}

function renderAvatars() {
  const guests = state.session?.guests || [];
  const pending = state.session?.joinRequests?.find((request) => request.status === "pending");
  avatarRow.innerHTML =
    guests.map((guest) => `<span class="avatar">${guest.initials || guest.name?.slice(0, 2).toUpperCase() || "G"}</span>`).join("") +
    (pending ? `<span class="avatar pending">${pending.guest.initials || "G"}</span>` : "");
  document.querySelector("#guestCount").textContent = String(guests.length + (pending ? 1 : 0));
  approveJoin.disabled = !pending;
  approveJoin.textContent = pending ? "Approve join" : "No pending joins";
}

function renderCart() {
  const items = state.cart?.items || [];
  const total = state.cart?.totals?.total || 0;
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  document.querySelector("#liveTotal").textContent = money(total);
  document.querySelector("#cartTotal").textContent = money(total);
  document.querySelector("#mobileTotal").textContent = money(total);
  document.querySelector("#cartCount").textContent = `${count} ${count === 1 ? "item" : "items"}`;
  document.querySelector("#sessionStatus").textContent = count ? "Building order" : "Browsing";

  const cartItems = document.querySelector("#cartItems");
  if (!items.length) {
    cartItems.innerHTML = `<p class="empty-cart">Add something lush to begin the table order.</p>`;
    return;
  }

  cartItems.innerHTML = items
    .map((item) => {
      const mods = item.modifiers?.map((modifier) => modifier.optionName).join(", ") || "Signature";
      return `
        <div class="cart-item">
          <div>
            <b>${item.name}</b>
            <small>${item.quantity} x ${item.guestName || "Guest"} - ${mods}</small>
          </div>
          <strong>${money(item.total)}</strong>
        </div>`;
    })
    .join("");
}

function renderModifierGroup(group) {
  const type = group.max === 1 ? "radio" : "checkbox";
  const selected = state.selectedModifiers.get(group.id) || [];
  const options = (group.options || [])
    .map((option) => {
      const checked = selected.includes(option.id) ? "checked" : "";
      const price = option.price ? ` + ${money(option.price)}` : "";
      return `
        <label class="check-row">
          <input type="${type}" name="modifier-${group.id}" data-group="${group.id}" data-option="${option.id}" ${checked} />
          ${option.name}${price}
        </label>`;
    })
    .join("");

  return `
    <div class="modifier-group">
      <span class="group-label">${group.name} ${group.required ? "<em>required</em>" : ""}</span>
      ${options}
    </div>`;
}

function openSheet(item) {
  state.selectedItem = item;
  state.selectedQty = 1;
  state.selectedModifiers.clear();

  for (const group of item.modifierGroups) {
    if (group.required && group.options?.[0]) {
      state.selectedModifiers.set(group.id, [group.options[0].id]);
    }
  }

  document.querySelector("#sheetImage").src = item.image;
  document.querySelector("#sheetImage").alt = item.name;
  document.querySelector("#sheetCategory").textContent = item.category;
  document.querySelector("#sheetTitle").textContent = item.name;
  document.querySelector("#sheetDesc").textContent = item.desc;
  document.querySelector("#sheetQty").textContent = "1";
  modifierGroups.innerHTML = item.modifierGroups.map(renderModifierGroup).join("");
  itemSheet.classList.add("is-open");
  itemSheet.setAttribute("aria-hidden", "false");
}

function closeBottomSheet() {
  itemSheet.classList.remove("is-open");
  itemSheet.setAttribute("aria-hidden", "true");
}

async function refreshSession() {
  if (!state.session?.id) return;
  state.session = await api(`/api/sessions/${state.session.id}`);
  renderAvatars();
}

async function refreshCart() {
  if (!state.session?.id) return;
  state.cart = await api(`/api/sessions/${state.session.id}/cart`);
  renderCart();
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-item]");
  if (!button) return;
  if (!state.guest || !state.session) {
    showNotice(menuGrid, "Start your table first", "Enter your name and start the QR session before adding items.");
    return;
  }
  const item = state.menu.find((menuItem) => menuItem.id === button.dataset.item);
  if (item) openSheet(item);
});

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const guestName = document.querySelector("#guestName").value.trim() || "Guest";
  const phone = document.querySelector("#guestPhone").value.trim();
  const pax = Number(document.querySelector("#paxCount").value || 4);
  const tableId = tableIdFromUrl();

  try {
    entryError.textContent = "";
    entryForm.querySelector("button").textContent = "Starting...";
    const result = await api("/api/sessions/start", {
      method: "POST",
      body: JSON.stringify({
        tableId,
        zoneId: "sky-terrace",
        guest: { name: guestName, phone, pax },
      }),
    });

    state.session = result.session;
    state.guest = result.guest || result.joinRequest?.guest || null;
    state.pendingJoinRequest = result.joinRequest || null;

    setTableLabels(state.session.tableId, state.session.zoneId);
    entry.style.display = "none";
    orderingView.classList.add("is-visible");
    document.querySelector("#mobileBar").style.display = "";
    await refreshCart();
    renderAvatars();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    entryError.textContent = `${error.message}. Check config.js API_BASE_URL.`;
    showNotice(menuGrid, "Session could not start", error.message);
  } finally {
    entryForm.querySelector("button").textContent = "Start Ordering";
  }
});

approveJoin.addEventListener("click", async () => {
  const pending = state.session?.joinRequests?.find((request) => request.status === "pending");
  if (!pending) return;

  const result = await api(`/api/sessions/${state.session.id}/join-request/${pending.id}/approve`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  state.session = result.session;
  renderAvatars();
});

document.querySelectorAll(".mood-button").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".mood-button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    appShell.dataset.mood = button.dataset.mood;
    document.querySelector("#daypartLabel").textContent = daypartLabels[button.dataset.mood] || "Live menu";
    await loadMenu(button.dataset.mood);
  });
});

document.querySelectorAll(".bill-mode button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

modifierGroups.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-group]");
  if (!input) return;
  const groupId = input.dataset.group;
  const current = state.selectedModifiers.get(groupId) || [];

  if (input.type === "radio") {
    state.selectedModifiers.set(groupId, [input.dataset.option]);
    return;
  }

  const next = input.checked ? [...current, input.dataset.option] : current.filter((optionId) => optionId !== input.dataset.option);
  state.selectedModifiers.set(groupId, next);
});

qtyMinus.addEventListener("click", () => {
  state.selectedQty = Math.max(1, state.selectedQty - 1);
  document.querySelector("#sheetQty").textContent = state.selectedQty;
});

qtyPlus.addEventListener("click", () => {
  state.selectedQty += 1;
  document.querySelector("#sheetQty").textContent = state.selectedQty;
});

closeSheet.addEventListener("click", closeBottomSheet);

addToCart.addEventListener("click", async () => {
  if (!state.selectedItem || !state.session || !state.guest) return;

  const modifiers = Array.from(state.selectedModifiers.entries()).flatMap(([groupId, optionIds]) =>
    optionIds.map((optionId) => ({ groupId, optionId })),
  );

  addToCart.textContent = "Adding...";
  try {
    state.cart = await api(`/api/sessions/${state.session.id}/cart/items`, {
      method: "POST",
      body: JSON.stringify({
        guestId: state.guest.id,
        menuItemId: state.selectedItem.id,
        quantity: state.selectedQty,
        modifiers,
      }),
    });
    closeBottomSheet();
    renderCart();
    await refreshSession();
  } finally {
    addToCart.textContent = "Add to shared order";
  }
});

sendOrder.addEventListener("click", async () => {
  if (!state.session || !state.guest || !state.cart?.items?.length) return;

  const kitchenNote = document.querySelector(".kitchen-note textarea").value.trim();
  sendOrder.textContent = "Sending...";
  try {
    state.lastOrder = await api(`/api/sessions/${state.session.id}/orders`, {
      method: "POST",
      body: JSON.stringify({
        guestId: state.guest.id,
        kitchenNote,
      }),
    });
    orderingView.classList.remove("is-visible");
    confirmation.classList.add("is-visible");
    document.querySelector("#mobileBar").style.display = "none";
    animateOrderStatus();
  } finally {
    sendOrder.textContent = "Send Order to Kitchen";
  }
});

function animateOrderStatus() {
  const steps = Array.from(document.querySelectorAll("#timeline span"));
  steps.forEach((step) => step.classList.remove("active"));
  steps[0].classList.add("active");
  steps.forEach((step, index) => {
    setTimeout(() => step.classList.add("active"), index * 900);
  });
}

backToMenu.addEventListener("click", async () => {
  confirmation.classList.remove("is-visible");
  orderingView.classList.add("is-visible");
  document.querySelector("#mobileBar").style.display = "";
  await refreshSession();
  await refreshCart();
});

document.querySelectorAll(".mobile-bar button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.scroll === "cart" ? document.querySelector("#cartPanel") : document.querySelector(".menu-shell");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

setTableLabels(tableIdFromUrl(), "sky-terrace");
renderCategories();
renderAvatars();
renderCart();
loadMenu();
