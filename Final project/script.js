const API_URL = "https://fakestoreapi.com/products?limit=3";
const PRODUCT_SOURCE = "simple-fake-api-v2";

const defaultProducts = [
    {
        id: 101,
        name: "Everyday Backpack",
        image: "",
        category: "Accessories",
        price: 48,
        description: "A dependable everyday bag with room for the things you carry most.",
        stock: 10
    },
    {
        id: 102,
        name: "Cloud Headphones",
        image: "",
        category: "Audio",
        price: 79,
        description: "Comfortable wireless headphones with clear sound for work and travel.",
        stock: 10
    },
    {
        id: 103,
        name: "Daily Tee",
        image: "",
        category: "Clothing",
        price: 24,
        description: "A soft, easy-to-wear cotton t-shirt for everyday comfort.",
        stock: 10
    }
];

const $ = (id) => document.getElementById(id);

function load(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const elements = {
    authView: $("authView"),
    authTitle: $("authTitle"),
    loginForm: $("loginForm"),
    registerForm: $("registerForm"),
    authMessage: $("authMessage"),
    switchAuth: $("switchAuth"),
    userBox: $("userBox"),
    customerView: $("customerView"),
    customerTitle: $("customerTitle"),
    customerProducts: $("customerProducts"),
    customerContent: $("customerContent"),
    customerMessage: $("customerMessage"),
    productTools: $("productTools"),
    search: $("search"),
    cartCount: $("cartCount"),
    adminView: $("adminView"),
    adminTitle: $("adminTitle"),
    adminProducts: $("adminProducts"),
    adminContent: $("adminContent"),
    adminAddProduct: $("adminAddProduct"),
    adminDeleteProducts: $("adminDeleteProducts")
};

let products = load("products", []);
let currentUser = loadSessionUser();
const productsReady = loadProducts();

setupStorage();
bindEvents();
productsReady.then(() => {
    if (currentUser) showApp();
});

function loadSessionUser() {
    try {
        return JSON.parse(sessionStorage.getItem("user")) || null;
    } catch (error) {
        return null;
    }
}

function setupStorage() {
    if (!localStorage.users) {
        save("users", [
            { name: "Admin", email: "admin@example.com", password: "admin123", role: "admin" },
            { name: "Customer", email: "user@example.com", password: "user123", role: "customer" }
        ]);
    }

    if (!localStorage.orders) save("orders", []);
    if (!localStorage.cart) save("cart", []);
}

async function loadProducts() {
    if (products.length && localStorage.productSource === PRODUCT_SOURCE) return;

    const savedProducts = products;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("API is not available");
        products = (await response.json()).map(toProduct);
        save("productSource", PRODUCT_SOURCE);
    } catch (error) {
        products = savedProducts.length ? savedProducts : defaultProducts;
    }

    products = products.map((product) => ({ ...product, image: product.image || "" }));
    save("products", products);
}

function toProduct(product) {
    return {
        id: product.id,
        name: product.title,
        image: product.image,
        category: product.category,
        price: Number(product.price),
        description: product.description,
        stock: 10
    };
}

function getImage(product) {
    const savedImage = product.image || "";
    if (/^https?:\/\//i.test(savedImage)) return savedImage;

    return "product-placeholder.svg";
}

function formatCurrency(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function showMessage(element, text, type = "success") {
    element.textContent = text;
    element.classList.toggle("d-none", !text);
    element.classList.remove("alert-success", "alert-danger", "alert-info", "alert-warning");
    if (text) element.classList.add(`alert-${type}`);
}

function statusBadge(status) {
    return `<span class="status-badge ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

function bindEvents() {
    elements.loginForm.addEventListener("submit", login);
    elements.registerForm.addEventListener("submit", register);
    elements.switchAuth.addEventListener("click", switchAuthForm);

    elements.customerProducts.addEventListener("click", showCustomerProducts);
    $("customerCart").addEventListener("click", showCustomerCart);
    $("customerOrders").addEventListener("click", showCustomerOrders);
    elements.search.addEventListener("input", searchProducts);
    elements.customerContent.addEventListener("click", handleCustomerClick);

    elements.adminProducts.addEventListener("click", showAdminProducts);
    elements.adminAddProduct.addEventListener("click", showAdminAddProduct);
    elements.adminDeleteProducts.addEventListener("click", showAdminDeleteProducts);
    $("adminOrders").addEventListener("click", showAdminOrders);
    elements.adminContent.addEventListener("click", handleAdminClick);
}

// Authentication
function login(event) {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;
    const user = load("users", []).find((item) => item.email.toLowerCase() === email && item.password === password);

    if (!user) {
        showAuthMessage("Wrong email or password.", true);
        return;
    }

    currentUser = user;
    sessionStorage.user = JSON.stringify(user);
    productsReady.then(showApp);
}

function register(event) {
    event.preventDefault();

    const users = load("users", []);
    const email = $("registerEmail").value.trim().toLowerCase();
    const name = $("registerName").value.trim();
    const password = $("registerPassword").value;

    if (users.some((user) => user.email.toLowerCase() === email)) {
        showAuthMessage("Email already exists.", true);
        return;
    }

    users.push({ name, email, password, role: "customer" });
    save("users", users);
    elements.registerForm.reset();
    showLoginForm();
    showAuthMessage("Account created. Login to continue.");
}

function switchAuthForm() {
    const registering = elements.registerForm.classList.contains("hidden");
    elements.registerForm.classList.toggle("hidden", !registering);
    elements.loginForm.classList.toggle("hidden", registering);
    elements.authTitle.textContent = registering ? "Create account" : "Login";
    elements.switchAuth.textContent = registering ? "Already have an account? Login" : "Need an account? Register";
    showAuthMessage("");
}

function showLoginForm() {
    elements.registerForm.classList.add("hidden");
    elements.loginForm.classList.remove("hidden");
    elements.authTitle.textContent = "Login";
    elements.switchAuth.textContent = "Need an account? Register";
}

function showAuthMessage(text, isError = false) {
    showMessage(elements.authMessage, text, isError ? "danger" : "success");
}

function showApp() {
    elements.authView.classList.add("hidden");
    elements.userBox.innerHTML = `
        <span class="small text-secondary">Hi, ${escapeHtml(currentUser.name)}</span>
        <span class="badge rounded-pill text-bg-primary">${escapeHtml(currentUser.role)}</span>
        <button id="logout" class="btn btn-sm btn-outline-secondary" type="button">Logout</button>`;
    $("logout").addEventListener("click", logout);

    if (currentUser.role === "admin") {
        elements.customerView.classList.add("hidden");
        elements.adminView.classList.remove("hidden");
        showAdminProducts();
    } else {
        elements.adminView.classList.add("hidden");
        elements.customerView.classList.remove("hidden");
        showCustomerProducts();
    }
}

function logout() {
    sessionStorage.removeItem("user");
    location.reload();
}

// Customer
function showCustomerProducts() {
    elements.customerTitle.textContent = "Products";
    elements.customerProducts.classList.add("hidden");
    elements.productTools.classList.remove("hidden");
    renderProducts(getFilteredProducts());
}

function searchProducts() {
    renderProducts(getFilteredProducts());
}

function getFilteredProducts() {
    const search = elements.search.value.trim().toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(search));
}

function renderProducts(list) {
    showMessage(elements.customerMessage, "");
    elements.cartCount.textContent = load("cart", []).length;

    if (!list.length) {
        elements.customerContent.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <div class="empty-icon" aria-hidden="true">⌕</div>
                    <h3 class="h5">No products found</h3>
                    <p class="mb-0">Try a different search term.</p>
                </div>
            </div>`;
        return;
    }

    elements.customerContent.innerHTML = list.map((product) => {
        const quantityInCart = load("cart", []).filter((id) => Number(id) === Number(product.id)).length;
        const unavailable = Number(product.stock) <= 0 || quantityInCart >= Number(product.stock);
        const buttonLabel = Number(product.stock) <= 0 ? "Out of stock" : quantityInCart >= Number(product.stock) ? "Stock limit reached" : "Add to cart";
        const description = product.description || "A useful addition to your everyday routine.";

        return `
            <div class="col-sm-6 col-xl-4">
                <article class="product-card">
                    <img class="product-image" src="${escapeHtml(getImage(product))}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='product-placeholder.svg';">
                    <div class="card-body">
                        <span class="category">${escapeHtml(product.category || "Other")}</span>
                        <h3>${escapeHtml(product.name)}</h3>
                        <p class="description">${escapeHtml(description)}</p>
                        ${description.length > 100 ? '<button class="show-description" data-action="description" type="button">Show more</button>' : ""}
                        <span class="price">${formatCurrency(product.price)}</span>
                        <small class="stock-note">${unavailable ? "Currently unavailable" : `${product.stock} available`}</small>
                        <div class="product-actions">
                            <button class="btn btn-primary" data-action="add" data-id="${Number(product.id)}" type="button" ${unavailable ? "disabled" : ""}>${buttonLabel}</button>
                        </div>
                    </div>
                </article>
            </div>`;
    }).join("");
}

function handleCustomerClick(event) {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.action === "add") addToCart(Number(button.dataset.id));
    if (button.dataset.action === "remove") removeFromCart(Number(button.dataset.id));
    if (button.id === "checkout") checkout();
    if (button.dataset.action === "description") toggleDescription(button);
}

function toggleDescription(button) {
    const description = button.closest(".product-card").querySelector(".description");
    const expanded = description.classList.toggle("expanded");
    button.textContent = expanded ? "Show less" : "Show more";
}

function addToCart(id) {
    const cart = load("cart", []);
    const product = products.find((item) => Number(item.id) === id);
    const quantity = cart.filter((item) => Number(item) === id).length;

    if (product && quantity < Number(product.stock)) {
        cart.push(id);
        save("cart", cart);
        elements.cartCount.textContent = cart.length;
        renderProducts(getFilteredProducts());
        showMessage(elements.customerMessage, `${product.name} added to cart.`);
    }
}

function showCustomerCart() {
    const cart = getCartProducts();
    const grouped = cart.reduce((items, product) => {
        const existing = items.find((item) => Number(item.product.id) === Number(product.id));
        if (existing) existing.quantity += 1;
        else items.push({ product, quantity: 1 });
        return items;
    }, []);
    const total = grouped.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

    showCustomerPage("Cart");
    elements.customerContent.innerHTML = grouped.length
        ? `<div class="col-12"><div class="card cart-card border-0 shadow-sm"><div class="card-body p-4 p-md-5">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div><span class="section-kicker">Ready when you are</span><h3 class="h4 mb-0">Your cart</h3></div>
                <span class="badge rounded-pill text-bg-light">${cart.length} item${cart.length === 1 ? "" : "s"}</span>
            </div>
            <div class="list">${grouped.map(({ product, quantity }) => `
                <div class="list-item">
                    <span class="item-info"><img class="item-image" src="${escapeHtml(getImage(product))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='product-placeholder.svg';"><span><strong>${escapeHtml(product.name)}</strong><br><span class="text-secondary">${quantity} × ${formatCurrency(product.price)}</span></span></span>
                    <button class="btn btn-sm btn-outline-danger" data-action="remove" data-id="${Number(product.id)}" type="button">Remove one</button>
                </div>`).join("")}</div>
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 border-top pt-4 mt-3">
                <div><span class="text-secondary d-block small">Total</span><strong class="fs-3">${formatCurrency(total)}</strong></div>
                <button id="checkout" class="btn btn-success btn-lg px-4" type="button">Checkout</button>
            </div>
        </div></div></div>`
        : `<div class="col-12"><div class="empty-state"><div class="empty-icon" aria-hidden="true">🛒</div><h3 class="h5">Your cart is empty</h3><p class="mb-0">Add a product to get started.</p></div></div>`;
}

function getCartProducts() {
    return load("cart", [])
        .map((id) => products.find((product) => Number(product.id) === Number(id)))
        .filter(Boolean);
}

function removeFromCart(id) {
    const cart = load("cart", []);
    const index = cart.findIndex((item) => Number(item) === id);
    if (index !== -1) cart.splice(index, 1);
    save("cart", cart);
    showCustomerCart();
}

function checkout() {
    const cart = load("cart", []);
    if (!cart.length) return;

    const orders = load("orders", []);
    orders.push({ id: Date.now(), email: currentUser.email, products: cart, status: "pending" });
    save("orders", orders);
    save("cart", []);
    showCustomerProducts();
    showMessage(elements.customerMessage, "Order placed successfully.");
}

function showCustomerOrders() {
    const orders = load("orders", []).filter((order) => order.email === currentUser.email);

    showCustomerPage("Orders");
    elements.customerContent.innerHTML = orders.length
        ? orders.map((order) => `<div class="col-12"><div class="order-card shadow-sm"><div class="d-flex flex-wrap justify-content-between align-items-start gap-3"><div><span class="section-kicker">Placed ${new Date(order.id).toLocaleDateString()}</span><h3 class="h5 mb-1">Order #${order.id}</h3><p class="text-secondary mb-0">${order.products.length} product${order.products.length === 1 ? "" : "s"}</p></div>${statusBadge(order.status)}</div></div></div>`).join("")
        : `<div class="col-12"><div class="empty-state"><div class="empty-icon" aria-hidden="true">▤</div><h3 class="h5">No orders yet</h3><p class="mb-0">Your completed orders will appear here.</p></div></div>`;
}

function showCustomerPage(title) {
    elements.customerTitle.textContent = title;
    elements.customerProducts.classList.remove("hidden");
    elements.productTools.classList.add("hidden");
    showMessage(elements.customerMessage, "");
}

// Admin
function showAdminProducts() {
    elements.adminTitle.textContent = "Products";
    setAdminNavigation("products");
    elements.adminContent.innerHTML = `<div class="card-body p-4 p-md-5">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3"><div><span class="section-kicker">Catalogue</span><h3 class="h4 mb-0">Current products</h3></div><span class="badge rounded-pill text-bg-light">${products.length} item${products.length === 1 ? "" : "s"}</span></div>
        <div class="list">${products.length ? products.map((product) => `
            <div class="list-item">
                <span class="item-info"><img class="item-image" src="${escapeHtml(getImage(product))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='product-placeholder.svg';"><span><strong>${escapeHtml(product.name)}</strong><br><span class="text-secondary">${escapeHtml(product.category || "Other")} · ${formatCurrency(product.price)} · ${product.stock} in stock</span></span></span>
                <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${Number(product.id)}" type="button">Edit</button>
            </div>`).join("") : `<div class="empty-state"><p class="mb-0">No products available.</p></div>`}</div>
    </div>`;
}

function setAdminNavigation(activeView) {
    elements.adminProducts.classList.toggle("hidden", activeView === "products");
    elements.adminAddProduct.classList.toggle("hidden", activeView === "add");
    elements.adminDeleteProducts.classList.toggle("hidden", activeView === "delete");
    const ordersButton = $("adminOrders");
    ordersButton.classList.toggle("btn-primary", activeView === "orders");
    ordersButton.classList.toggle("btn-outline-primary", activeView !== "orders");
}

function showAdminAddProduct() {
    elements.adminTitle.textContent = "Add product";
    setAdminNavigation("add");
    elements.adminContent.innerHTML = `<div class="card-body p-4 p-md-5">
        <div class="mb-4"><span class="section-kicker">Catalogue</span><h3 id="productFormTitle" class="h4 mb-1">Add product</h3><p class="text-secondary mb-0">Add the details customers need to make a confident choice.</p></div>
        <form id="productForm" class="admin-form row g-3">
            <input id="productId" type="hidden">
            <div class="col-md-6"><label class="form-label" for="productName">Product name</label><input id="productName" class="form-control" placeholder="Product name" required></div>
            <div class="col-md-6"><label class="form-label" for="productCategory">Category</label><input id="productCategory" class="form-control" placeholder="Category" required></div>
            <div class="col-md-6"><label class="form-label" for="productPrice">Price</label><div class="input-group"><span class="input-group-text">$</span><input id="productPrice" class="form-control" type="number" min="0" step="0.01" placeholder="0.00" required></div></div>
            <div class="col-md-6"><label class="form-label" for="productStock">Stock</label><input id="productStock" class="form-control" type="number" min="0" step="1" placeholder="0" required></div>
            <div class="col-12"><label class="form-label" for="productImage">Image URL <span class="text-secondary fw-normal">(optional)</span></label><input id="productImage" class="form-control" type="url" placeholder="https://..."></div>
            <div class="col-12"><label class="form-label" for="productDescription">Description</label><textarea id="productDescription" class="form-control" rows="4" placeholder="Describe the product" required></textarea></div>
            <div class="col-12 d-flex flex-wrap gap-2 pt-2"><button id="productSubmit" class="btn btn-success" type="submit">Add product</button><button id="cancelEdit" class="btn btn-outline-secondary hidden" type="button">Cancel edit</button></div>
        </form>
    </div>`;

    $("productForm").addEventListener("submit", saveProduct);
    $("cancelEdit").addEventListener("click", cancelEdit);
}

function showAdminDeleteProducts() {
    elements.adminTitle.textContent = "Delete products";
    setAdminNavigation("delete");
    elements.adminContent.innerHTML = `<div class="card-body p-4 p-md-5">
        <div class="mb-4"><span class="section-kicker">Catalogue</span><h3 class="h4 mb-1">Remove products</h3><p class="text-secondary mb-0">Choose a product to remove it from the store.</p></div>
        <div class="list">${products.length ? products.map((product) => `
            <div class="list-item"><span class="item-info"><img class="item-image" src="${escapeHtml(getImage(product))}" alt="" loading="lazy" onerror="this.onerror=null;this.src='product-placeholder.svg';"><span><strong>${escapeHtml(product.name)}</strong><br><span class="text-secondary">${formatCurrency(product.price)}</span></span></span><button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${Number(product.id)}" type="button">Delete</button></div>`).join("") : '<div class="empty-state"><p class="mb-0">No products to delete.</p></div>'}</div>
    </div>`;
}

function saveProduct(event) {
    event.preventDefault();

    const productId = Number($("productId").value);
    const productData = {
        name: $("productName").value.trim(),
        image: $("productImage").value.trim(),
        category: $("productCategory").value.trim(),
        price: Number($("productPrice").value),
        stock: Number($("productStock").value),
        description: $("productDescription").value.trim()
    };

    if (!productData.name || !productData.category || !productData.description || Number.isNaN(productData.price) || Number.isNaN(productData.stock)) return;

    if (productId) {
        const product = products.find((item) => Number(item.id) === productId);
        if (product) Object.assign(product, productData);
    } else {
        products.push({ id: Date.now(), ...productData });
    }

    save("products", products);
    showAdminProducts();
}

function editProduct(id) {
    const product = products.find((item) => Number(item.id) === id);
    if (!product) return;

    showAdminAddProduct();
    $("productId").value = product.id;
    $("productName").value = product.name;
    $("productCategory").value = product.category || "Other";
    $("productPrice").value = product.price;
    $("productStock").value = product.stock;
    $("productImage").value = product.image || "";
    $("productDescription").value = product.description;
    $("productFormTitle").textContent = "Edit product";
    $("productSubmit").textContent = "Save changes";
    $("cancelEdit").classList.remove("hidden");
    $("productName").focus();
}

function cancelEdit() {
    showAdminProducts();
}

function handleAdminClick(event) {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.action === "edit") editProduct(Number(button.dataset.id));
    if (button.dataset.action === "delete") deleteProduct(Number(button.dataset.id));
    if (button.dataset.action === "status") changeOrderStatus(Number(button.dataset.id), button.dataset.status);
}

function deleteProduct(id) {
    const product = products.find((item) => Number(item.id) === id);
    if (!product || !window.confirm(`Delete ${product.name}?`)) return;

    products = products.filter((item) => Number(item.id) !== id);
    save("products", products);
    showAdminDeleteProducts();
}

function changeOrderStatus(id, status) {
    const orders = load("orders", []);
    const order = orders.find((item) => Number(item.id) === id);
    if (!order) return;

    order.status = status;
    save("orders", orders);
    showAdminOrders();
}

function showAdminOrders() {
    elements.adminTitle.textContent = "Orders";
    setAdminNavigation("orders");
    const orders = load("orders", []);

    elements.adminContent.innerHTML = `<div class="card-body p-4 p-md-5">
        <div class="mb-4"><span class="section-kicker">Store activity</span><h3 class="h4 mb-1">Customer orders</h3><p class="text-secondary mb-0">Review purchases and update their status.</p></div>
        ${orders.length ? `<div class="list">${orders.map((order) => `<div class="list-item"><div><strong>Order #${order.id}</strong><div class="small text-secondary">${escapeHtml(order.email)} · ${new Date(order.id).toLocaleDateString()}</div><div class="order-images">${order.products.map((id) => products.find((product) => Number(product.id) === Number(id))).filter(Boolean).map((product) => `<img class="order-image" src="${escapeHtml(getImage(product))}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='product-placeholder.svg';">`).join("")}</div></div><div class="actions d-flex flex-wrap align-items-center gap-2">${statusBadge(order.status)}<button class="btn btn-sm btn-success" data-action="status" data-status="confirmed" data-id="${Number(order.id)}" type="button">Confirm</button><button class="btn btn-sm btn-outline-danger" data-action="status" data-status="rejected" data-id="${Number(order.id)}" type="button">Reject</button></div></div>`).join("")}</div>` : '<div class="empty-state"><div class="empty-icon" aria-hidden="true">▤</div><h3 class="h5">No orders yet</h3><p class="mb-0">New orders will appear here.</p></div>'}
    </div>`;
}