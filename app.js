const categories = ["Cocktails", "Coffee", "Starters", "Main Course", "Desserts", "Party Platters"];

const menu = [
  {
    category: "Cocktails",
    name: "Sunset Negroni",
    desc: "Bitter orange, smoked rosemary, walnut-aged finish.",
    price: 645,
    veg: true,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Cocktails",
    name: "Blue LED Highball",
    desc: "Gin, kaffir lime, tonic mist, chilled blue glow.",
    price: 595,
    veg: true,
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Coffee",
    name: "Cloud Nine Cold Brew",
    desc: "Slow brew coffee, vanilla foam, dark cocoa dust.",
    price: 325,
    veg: true,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Coffee",
    name: "Affogato Martini",
    desc: "Espresso cream, gelato, amber caramel snap.",
    price: 425,
    veg: true,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Starters",
    name: "Truffle Corn Ribs",
    desc: "Charred corn, parmesan snow, house chilli lime.",
    price: 395,
    veg: true,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Starters",
    name: "Korean Fire Chicken",
    desc: "Crisp bites, gochujang glaze, sesame scallions.",
    price: 495,
    veg: false,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Main Course",
    name: "Walnut Basil Linguine",
    desc: "Hand-tossed pasta, basil cream, roasted walnut crumb.",
    price: 565,
    veg: true,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Main Course",
    name: "Smoked Butter Chicken Bowl",
    desc: "Charcoal butter gravy, saffron rice, pickled onion.",
    price: 625,
    veg: false,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Desserts",
    name: "Amber Tiramisu",
    desc: "Coffee-soaked layers, mascarpone, salted caramel glass.",
    price: 385,
    veg: true,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Party Platters",
    name: "Rooftop Mezze Board",
    desc: "Hummus trio, lavash, grilled olives, herb feta.",
    price: 1095,
    veg: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Party Platters",
    name: "Lounge Grill Platter",
    desc: "Chicken skewers, peri prawns, roasted peppers, dips.",
    price: 1495,
    veg: false,
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=900&q=80",
  },
];

const state = {
  activeCategory: "Cocktails",
  guests: ["Vi", "An", "SR"],
  cart: [],
  selectedItem: null,
  selectedQty: 1,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

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

window.addEventListener("load", () => {
  setTimeout(() => splash.classList.add("is-hidden"), 900);
});

function money(value) {
  return currency.format(value).replace("₹", "Rs ");
}

function renderCategories() {
  categoryTabs.innerHTML = categories
    .map(
      (category) =>
        `<button type="button" class="${category === state.activeCategory ? "active" : ""}" data-category="${category}">${category}</button>`,
    )
    .join("");
}

function renderMenu() {
  const items = menu.filter((item) => item.category === state.activeCategory);
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
              <button class="add-button" type="button" data-item="${item.name}">Add</button>
            </div>
          </div>
        </article>`,
    )
    .join("");
}

function renderAvatars() {
  const pending = state.guests.includes("MJ") ? "" : `<span class="avatar pending">MJ</span>`;
  avatarRow.innerHTML = state.guests.map((guest) => `<span class="avatar">${guest}</span>`).join("") + pending;
  document.querySelector("#guestCount").textContent = String(state.guests.length + (pending ? 1 : 0));
}

function cartTotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const total = cartTotal();
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelector("#liveTotal").textContent = money(total);
  document.querySelector("#cartTotal").textContent = money(total);
  document.querySelector("#mobileTotal").textContent = money(total);
  document.querySelector("#cartCount").textContent = `${count} ${count === 1 ? "item" : "items"}`;
  document.querySelector("#sessionStatus").textContent = count ? "Building order" : "Browsing";

  const cartItems = document.querySelector("#cartItems");
  if (!state.cart.length) {
    cartItems.innerHTML = `<p class="empty-cart">Add something lush to begin the table order.</p>`;
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <b>${item.name}</b>
          <small>${item.qty} x ${item.owner} · ${item.mods}</small>
        </div>
        <strong>${money(item.price * item.qty)}</strong>
      </div>`,
    )
    .join("");
}

function openSheet(item) {
  state.selectedItem = item;
  state.selectedQty = 1;
  document.querySelector("#sheetImage").src = item.image;
  document.querySelector("#sheetImage").alt = item.name;
  document.querySelector("#sheetCategory").textContent = item.category;
  document.querySelector("#sheetTitle").textContent = item.name;
  document.querySelector("#sheetDesc").textContent = item.desc;
  document.querySelector("#sheetQty").textContent = "1";
  itemSheet.classList.add("is-open");
  itemSheet.setAttribute("aria-hidden", "false");
}

function closeBottomSheet() {
  itemSheet.classList.remove("is-open");
  itemSheet.setAttribute("aria-hidden", "true");
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
  const item = menu.find((menuItem) => menuItem.name === button.dataset.item);
  openSheet(item);
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const guestName = document.querySelector("#guestName").value.trim() || "Guest";
  const pax = Number(document.querySelector("#paxCount").value || 4);
  state.guests = [guestName.slice(0, 2).toUpperCase(), "An", "SR"].slice(0, Math.max(1, Math.min(pax, 3)));
  entry.style.display = "none";
  orderingView.classList.add("is-visible");
  document.querySelector("#mobileBar").style.display = "";
  renderAvatars();
  renderCart();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

approveJoin.addEventListener("click", () => {
  if (!state.guests.includes("MJ")) {
    state.guests.push("MJ");
    approveJoin.textContent = "MJ joined";
    renderAvatars();
  }
});

document.querySelectorAll(".mood-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    appShell.dataset.mood = button.dataset.mood;
    const labels = {
      breakfast: "Breakfast rooftop menu",
      evening: "Evening cafe menu",
      night: "Night lounge menu",
    };
    document.querySelector("#daypartLabel").textContent = labels[button.dataset.mood];
  });
});

document.querySelectorAll(".segmented button, .bill-mode button").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
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

addToCart.addEventListener("click", () => {
  const checked = Array.from(itemSheet.querySelectorAll("input[type='checkbox']:checked")).map((input) => input.value);
  const item = state.selectedItem;
  state.cart.push({
    ...item,
    qty: state.selectedQty,
    owner: state.guests[0] || "Guest",
    mods: checked.length ? checked.join(", ") : "Signature",
  });
  closeBottomSheet();
  renderCart();
});

sendOrder.addEventListener("click", () => {
  if (!state.cart.length) return;
  orderingView.classList.remove("is-visible");
  confirmation.classList.add("is-visible");
  document.querySelector("#mobileBar").style.display = "none";
  const steps = Array.from(document.querySelectorAll("#timeline span"));
  steps.forEach((step) => step.classList.remove("active"));
  steps[0].classList.add("active");
  steps.forEach((step, index) => {
    setTimeout(() => step.classList.add("active"), index * 900);
  });
});

backToMenu.addEventListener("click", () => {
  confirmation.classList.remove("is-visible");
  orderingView.classList.add("is-visible");
  document.querySelector("#mobileBar").style.display = "";
});

document.querySelectorAll(".mobile-bar button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.scroll === "cart" ? document.querySelector("#cartPanel") : document.querySelector(".menu-shell");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

renderCategories();
renderMenu();
renderAvatars();
renderCart();
