import { db, auth } from "./firebase-config.js";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let allOrders = [];

const statuses = ["Pending", "Preparing", "OnTheWay", "Delivered", "Cancelled"];

const fakeNames = [
  "Ahmed", "Mohamed", "Tarek", "Omar", "Youssef",
  "Ali", "Mostafa", "Mahmoud", "Khaled", "Hassan",
  "Mona", "Sara", "Nour", "Salma", "Aya"
];

const fakeMenuItems = [
  { id: 1, category: "Sandwiches", name: "Zinger / Tender Chicken", price: 85 },
  { id: 2, category: "Sandwiches", name: "Crunchy Twister", price: 85 },
  { id: 3, category: "Sandwiches", name: "Hulk Chicken Burger", price: 105 },
  { id: 4, category: "Sandwiches", name: "Classic Chicken Burger", price: 95 },
  { id: 5, category: "Sandwiches", name: "Hot Chicken Burger", price: 95 },
  { id: 6, category: "Sandwiches", name: "Smoky Chicken Burger", price: 90 },
  { id: 7, category: "Sandwiches", name: "BBQ Chicken Burger", price: 95 },
  { id: 8, category: "Sandwiches", name: "Hulk Twister", price: 100 },
  { id: 9, category: "Broast", name: "2 Chicken Pieces", price: 110 },
  { id: 10, category: "Broast", name: "4 Chicken Pieces", price: 195 },
  { id: 11, category: "Broast", name: "5 Chicken Pieces", price: 215 },
  { id: 12, category: "Broast", name: "9 Chicken Pieces", price: 380 },
  { id: 13, category: "Broast", name: "12 Chicken Pieces", price: 495 },
  { id: 14, category: "Broast", name: "15 Chicken Pieces", price: 600 },
  { id: 15, category: "Broast", name: "20 Chicken Pieces", price: 760 }
];

window.loginAdmin = async function () {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  const resultDiv = document.getElementById("adminLoginResult");

  if (!email || !password) {
    resultDiv.innerHTML = `<div class="error">Please enter email and password</div>`;
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    resultDiv.innerHTML = `<div class="success">Login successful</div>`;
  } catch (error) {
    resultDiv.innerHTML = `<div class="error">Login failed: ${error.message}</div>`;
  }
};

async function loadAllOrdersInternal() {
  try {
    const snapshot = await getDocs(collection(db, "orders"));

    allOrders = snapshot.docs.map((docSnap) => ({
      docId: docSnap.id,
      ...docSnap.data()
    }));

    allOrders.sort((a, b) => {
      const aVal = a.orderId || "";
      const bVal = b.orderId || "";
      return bVal.localeCompare(aVal);
    });

    updateDashboard();
    renderOrders();
  } catch (error) {
    const ordersList = document.getElementById("ordersList");
    if (ordersList) {
      ordersList.innerHTML = `<div class="error">Failed to load orders: ${error.message}</div>`;
    }
  }
}

window.loadAllOrders = async function () {
  await loadAllOrdersInternal();
};

function updateDashboard() {
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = allOrders.filter((o) => o.status === "Delivered").length;

  document.getElementById("statTotalOrders").textContent = totalOrders;
  document.getElementById("statRevenue").textContent = `${totalRevenue} EGP`;
  document.getElementById("statPending").textContent = pendingOrders;
  document.getElementById("statDelivered").textContent = deliveredOrders;
}

window.renderOrders = function () {
  const listDiv = document.getElementById("ordersList");
  const search = (document.getElementById("searchInput").value || "").toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;

  const filtered = allOrders.filter((order) => {
    const orderId = (order.orderId || "").toLowerCase();
    const customerName = (order.customerName || "").toLowerCase();
    const phone = (order.phone || "").toLowerCase();

    const matchesSearch =
      orderId.includes(search) ||
      customerName.includes(search) ||
      phone.includes(search);

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!filtered.length) {
    listDiv.innerHTML = `<div class="small">No matching orders found</div>`;
    return;
  }

  const ordersToShow = filtered.slice(0, 50);

  let html = `<div class="small" style="margin-bottom:12px;">Showing ${ordersToShow.length} of ${filtered.length} orders</div>`;

  ordersToShow.forEach((order) => {
    const itemsHtml = (order.items || [])
      .map((item) => {
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        return `<div class="small">- ${item.name} × ${qty} = ${price * qty} EGP</div>`;
      })
      .join("");

    html += `
      <div class="order-card">
        <h3>Order ${order.orderId || "-"}</h3>
        <div><strong>Customer:</strong> ${order.customerName || "-"}</div>
        <div><strong>Phone:</strong> ${order.phone || "-"}</div>
        <div><strong>Created:</strong> ${order.createdAt || "-"}</div>
        <div><strong>Total:</strong> ${order.total || 0} EGP</div>
        <div style="margin:8px 0;">
          <strong>Status:</strong>
          <span class="status ${order.status || "Pending"}">${order.status || "Pending"}</span>
        </div>
        <div><strong>Items:</strong></div>
        ${itemsHtml || `<div class="small">No items</div>`}

        <div class="admin-actions">
          <select id="status-${order.docId}">
            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Preparing" ${order.status === "Preparing" ? "selected" : ""}>Preparing</option>
            <option value="OnTheWay" ${order.status === "OnTheWay" ? "selected" : ""}>On The Way</option>
            <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
            <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
          <button class="main-btn small-btn" onclick="changeOrderStatus('${order.docId}')">Update</button>
          <button class="danger" onclick="deleteOrder('${order.docId}')">Delete</button>
        </div>
      </div>
    `;
  });

  listDiv.innerHTML = html;
};

window.changeOrderStatus = async function (docId) {
  const newStatus = document.getElementById(`status-${docId}`).value;

  try {
    await updateDoc(doc(db, "orders", docId), { status: newStatus });
    await loadAllOrdersInternal();
  } catch (error) {
    alert("Failed to update status: " + error.message);
  }
};

window.deleteOrder = async function (docId) {
  const ok = confirm("Are you sure you want to delete this order?");
  if (!ok) return;

  try {
    await deleteDoc(doc(db, "orders", docId));
    await loadAllOrdersInternal();
  } catch (error) {
    alert("Failed to delete order: " + error.message);
  }
};

window.logoutAdmin = async function () {
  try {
    await signOut(auth);
  } catch (error) {
    alert("Logout failed: " + error.message);
  }
};

onAuthStateChanged(auth, async (user) => {
  const adminPanel = document.getElementById("adminPanel");
  const loginResult = document.getElementById("adminLoginResult");

  if (user) {
    adminPanel.style.display = "block";
    loginResult.innerHTML = `<div class="success">Logged in as ${user.email}</div>`;
    await loadAllOrdersInternal();
  } else {
    adminPanel.style.display = "none";
    loginResult.innerHTML = "";
  }
});

window.downloadOrdersCSV = async function () {
  if (!allOrders.length) {
    await loadAllOrdersInternal();
  }

  if (!allOrders.length) {
    alert("No orders to export");
    return;
  }

  let csv = "Document ID,Order ID,Customer Name,Phone,Total,Status,Created At,Created At ISO,Items Summary\n";

  allOrders.forEach((order) => {
    const itemsSummary = (order.items || [])
      .map((item) => `${item.name} x${item.quantity} (${item.price} EGP)`)
      .join(" | ");

    const row = [
      order.docId || "",
      order.orderId || "",
      order.customerName || "",
      order.phone || "",
      order.total || 0,
      order.status || "",
      order.createdAt || "",
      order.createdAtISO || "",
      itemsSummary
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",");

    csv += row + "\n";
  });

  downloadCSVFile(csv, "orders.csv");
};

window.downloadOrderItemsCSV = async function () {
  if (!allOrders.length) {
    await loadAllOrdersInternal();
  }

  if (!allOrders.length) {
    alert("No orders to export");
    return;
  }

  let csv = "Document ID,Order ID,Customer Name,Phone,Product ID,Product Name,Category,Price,Quantity,Line Total,Order Total,Status,Created At,Created At ISO\n";

  allOrders.forEach((order) => {
    const items = order.items || [];

    items.forEach((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);

      const row = [
        order.docId || "",
        order.orderId || "",
        order.customerName || "",
        order.phone || "",
        item.id || "",
        item.name || "",
        item.category || "",
        item.price || 0,
        item.quantity || 0,
        lineTotal,
        order.total || 0,
        order.status || "",
        order.createdAt || "",
        order.createdAtISO || ""
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");

      csv += row + "\n";
    });
  });

  downloadCSVFile(csv, "order_items.csv");
};

function downloadCSVFile(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}

window.generateFakeOrders = async function () {
  const count = 100;
  const btn = document.getElementById("generateBtn");
  const resultDiv = document.getElementById("generateResult");

  try {
    if (btn) btn.disabled = true;
    if (btn) btn.textContent = "Generating...";
    if (resultDiv) {
      resultDiv.innerHTML = `<div class="small">Please wait, generating ${count} orders...</div>`;
    }

    for (let i = 0; i < count; i++) {
      const customerName = randomFrom(fakeNames);
      const phone = randomPhone();
      const items = randomItems();
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const status = randomFrom(statuses);
      const orderDate = randomDateWithinLast30Days();
      const orderId = "BRG-" + (Date.now() + i);

      await addDoc(collection(db, "orders"), {
        orderId,
        customerName,
        phone,
        items,
        total,
        status,
        createdAt: orderDate.toLocaleString("en-US"),
        createdAtISO: orderDate.toISOString()
      });

      if (resultDiv && (i + 1) % 25 === 0) {
        resultDiv.innerHTML = `<div class="small">Generated ${i + 1} of ${count} orders...</div>`;
      }
    }

    if (resultDiv) {
      resultDiv.innerHTML = `<div class="success">${count} fake orders generated successfully!</div>`;
    }

    await loadAllOrdersInternal();
  } catch (error) {
    if (resultDiv) {
      resultDiv.innerHTML = `<div class="error">Failed to generate orders: ${error.message}</div>`;
    } else {
      alert("Failed to generate orders: " + error.message);
    }
  } finally {
    if (btn) btn.disabled = false;
    if (btn) btn.textContent = "Generate Orders";
  }
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone() {
  return "01" + Math.floor(100000000 + Math.random() * 900000000);
}

function randomDateWithinLast30Days() {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - Math.floor(Math.random() * 30));
  past.setHours(Math.floor(Math.random() * 24));
  past.setMinutes(Math.floor(Math.random() * 60));
  past.setSeconds(Math.floor(Math.random() * 60));
  return past;
}

function randomItems() {
  const numItems = Math.floor(Math.random() * 3) + 1;
  const selected = [];
  const usedIds = new Set();

  while (selected.length < numItems) {
    const item = randomFrom(fakeMenuItems);
    if (usedIds.has(item.id)) continue;

    usedIds.add(item.id);

    selected.push({
      ...item,
      quantity: Math.floor(Math.random() * 3) + 1
    });
  }

  return selected;
}