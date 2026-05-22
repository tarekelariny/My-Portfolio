import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

window.showSection = function (sectionId) {
  document.querySelectorAll(".section").forEach((sec) => sec.classList.remove("active"));

  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.add("active");

  const btnShop = document.getElementById("btn-shop");
  const btnTrack = document.getElementById("btn-track");

  if (btnShop) btnShop.classList.remove("active");
  if (btnTrack) btnTrack.classList.remove("active");

  const activeBtn = document.getElementById("btn-" + sectionId);
  if (activeBtn) activeBtn.classList.add("active");
};

const menu = [
  { id: 1, category: "Sandwiches", name: "Zinger / Tender Chicken", subtitle: "2 crispy chicken pieces, mayonnaise, lettuce, cheddar slices", price: 85, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80" },
  { id: 2, category: "Sandwiches", name: "Crunchy Twister", subtitle: "2 crispy chicken pieces, fries, mayonnaise, lettuce, cheddar slices", price: 85, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80" },
  { id: 3, category: "Sandwiches", name: "Hulk Chicken Burger", subtitle: "Crispy chicken fillet, mayonnaise, burger sauce, beef slice, cheddar slices", price: 105, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
  { id: 4, category: "Sandwiches", name: "Classic Chicken Burger", subtitle: "Crispy chicken fillet, mayonnaise, lettuce, cheddar slices", price: 95, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80" },
  { id: 5, category: "Sandwiches", name: "Hot Chicken Burger", subtitle: "Spicy crispy chicken fillet, jalapeno, mayonnaise, lettuce, cheddar slices", price: 95, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80" },
  { id: 6, category: "Sandwiches", name: "Smoky Chicken Burger", subtitle: "Crispy chicken fillet, smoky sauce, lettuce, cheddar slices", price: 90, image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&q=80" },
  { id: 7, category: "Sandwiches", name: "BBQ Chicken Burger", subtitle: "Crispy chicken fillet, mayonnaise, BBQ sauce, lettuce, cheddar slices", price: 95, image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80" },
  { id: 8, category: "Sandwiches", name: "Hulk Twister", subtitle: "2 crispy chicken pieces, mayonnaise, broast sauce, beef slices, lettuce, cheddar slices", price: 100, image: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80" },
  { id: 9, category: "Broast", name: "2 Chicken Pieces", subtitle: "2 bread, fries, 1 garlic dip, ketchup", price: 110, image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80" },
  { id: 10, category: "Broast", name: "4 Chicken Pieces", subtitle: "4 bread, fries, 1 garlic dip, 1 coleslaw, ketchup", price: 195, image: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?auto=format&fit=crop&w=800&q=80" },
  { id: 11, category: "Broast", name: "5 Chicken Pieces", subtitle: "4 bread, fries, 1 garlic dip, 1 coleslaw, ketchup", price: 215, image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=800&q=80" },
  { id: 12, category: "Broast", name: "9 Chicken Pieces", subtitle: "8 bread, fries, 2 garlic dips, 2 coleslaw, ketchup", price: 380, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
  { id: 13, category: "Broast", name: "12 Chicken Pieces", subtitle: "12 bread, fries, 3 garlic dips, 3 coleslaw, ketchup", price: 495, image: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?auto=format&fit=crop&w=800&q=80" },
  { id: 14, category: "Broast", name: "15 Chicken Pieces", subtitle: "14 bread, fries, 3 garlic dips, 3 coleslaw, ketchup", price: 600, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80" },
  { id: 15, category: "Broast", name: "20 Chicken Pieces", subtitle: "16 bread, fries, 4 garlic dips, 4 coleslaw, ketchup", price: 760, image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=80" }
];

let cart = [];
let itemCounts = {};

menu.forEach((item) => {
  itemCounts[item.id] = 0;
});

function renderMenuByCategory() {
  const container = document.getElementById("menuContainer");
  if (!container) return;

  const categories = [...new Set(menu.map((item) => item.category))];
  container.innerHTML = "";

  categories.forEach((category) => {
    const items = menu.filter((item) => item.category === category);

    let html = `
      <div style="margin-bottom:30px;">
        <h3 class="category-title">${category}</h3>
        <div class="menu-items">
    `;

    items.forEach((item) => {
      html += `
        <div class="item">
          <img src="${item.image}" alt="${item.name}">
          <div class="item-body">
            <h3>${item.name}</h3>
            <div class="subtitle">${item.subtitle}</div>
            <div class="qty-inline">
              <button onclick="increaseMenuQty(${item.id})">+</button>
              <span id="count-${item.id}">0</span>
              <button onclick="decreaseMenuQty(${item.id})">-</button>
            </div>
            <div class="price">${item.price} EGP</div>
            <button class="add-btn" onclick="addSelectedToCart(${item.id})">Add to Cart</button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML += html;
  });
}

window.increaseMenuQty = function (id) {
  itemCounts[id]++;
  const countEl = document.getElementById(`count-${id}`);
  if (countEl) countEl.textContent = itemCounts[id];
};

window.decreaseMenuQty = function (id) {
  itemCounts[id] = Math.max(0, itemCounts[id] - 1);
  const countEl = document.getElementById(`count-${id}`);
  if (countEl) countEl.textContent = itemCounts[id];
};

window.addSelectedToCart = function (id) {
  const qty = itemCounts[id];
  if (qty <= 0) return;

  const item = menu.find((m) => m.id === id);
  if (!item) return;

  const existing = cart.find((c) => c.id === id);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ ...item, quantity: qty });
  }

  itemCounts[id] = 0;
  const countEl = document.getElementById(`count-${id}`);
  if (countEl) countEl.textContent = 0;

  renderCart();
};

window.increaseQty = function (id) {
  const item = cart.find((c) => c.id === id);
  if (item) item.quantity++;
  renderCart();
};

window.decreaseQty = function (id) {
  const item = cart.find((c) => c.id === id);

  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      cart = cart.filter((c) => c.id !== id);
    }
  }

  renderCart();
};

window.removeFromCart = function (id) {
  cart = cart.filter((c) => c.id !== id);
  renderCart();
};

function renderCart() {
  const cartDiv = document.getElementById("cart");
  const totalSpan = document.getElementById("total");

  if (!cartDiv || !totalSpan) return;

  if (cart.length === 0) {
    cartDiv.innerHTML = `<div class="small">Your cart is empty</div>`;
    totalSpan.textContent = "0";
    return;
  }

  let total = 0;
  cartDiv.innerHTML = "";

  cart.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <div class="cart-head">
          <div>
            <strong>${item.name}</strong><br>
            <span class="small">${item.subtitle || ""}</span><br>
            <span class="small">${item.price} EGP each</span><br>
            <span class="small">Line Total: ${lineTotal} EGP</span>
          </div>
          <button class="delete-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
        <div class="mini-controls">
          <button onclick="increaseQty(${item.id})">+</button>
          <span>${item.quantity}</span>
          <button onclick="decreaseQty(${item.id})">-</button>
        </div>
      </div>
    `;
  });

  totalSpan.textContent = total;
}

window.submitOrder = async function () {
  const customerName = document.getElementById("customerName")?.value.trim() || "";
  const phone = document.getElementById("phone")?.value.trim() || "";
  const resultDiv = document.getElementById("orderResult");

  if (!resultDiv) return;

  if (!customerName || !phone || cart.length === 0) {
    resultDiv.innerHTML = `<div class="error">Please fill in your details and add items to cart</div>`;
    return;
  }

  try {
    const now = new Date();
    const orderId = "BRG-" + Date.now();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await addDoc(collection(db, "orders"), {
      orderId,
      customerName,
      phone,
      items: cart,
      total,
      status: "Pending",
      createdAt: now.toLocaleString("en-US"),
      createdAtISO: now.toISOString()
    });

    resultDiv.innerHTML = `
      <div class="success">
        Order submitted successfully<br>
        Order ID: <strong>${orderId}</strong><br>
        Total: <strong>${total} EGP</strong><br>
        Status: <strong>Pending</strong>
      </div>
    `;

    cart = [];
    renderCart();

    const nameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("phone");

    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Failed to submit order: ${error.message}</div>`;
  }
};

window.trackOrder = async function () {
  const orderId = document.getElementById("trackOrderId")?.value.trim() || "";
  const resultDiv = document.getElementById("trackResult");

  if (!resultDiv) return;

  if (!orderId) {
    resultDiv.innerHTML = `<div class="error">Please enter an order ID</div>`;
    return;
  }

  try {
    const q = query(collection(db, "orders"), where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      resultDiv.innerHTML = `<div class="error">Order not found</div>`;
      return;
    }

    const order = snapshot.docs[0].data();

    resultDiv.innerHTML = `
      <div class="success">
        <strong>Order ID:</strong> ${order.orderId}<br>
        <strong>Name:</strong> ${order.customerName}<br>
        <strong>Phone:</strong> ${order.phone}<br>
        <strong>Total:</strong> ${order.total} EGP<br>
        <strong>Status:</strong> <span class="status ${order.status}">${order.status}</span><br>
        <strong>Created At:</strong> ${order.createdAt}
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Failed to track order: ${error.message}</div>`;
  }
};

renderMenuByCategory();
renderCart();