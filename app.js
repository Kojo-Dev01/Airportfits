/* ============================================================
   AIRPORTFITS — SPA JAVASCRIPT
   ============================================================ */

'use strict';

// ── CONSTANTS ─────────────────────────────────────────────
const CGI_BIN = 'cgi-bin';

const COLOR_MAP = {
  'Jet Black':    { key: 'black', swatch: 'swatch-black', img: './assets/product-black-set.png' },
  'Heather Grey': { key: 'grey',  swatch: 'swatch-grey',  img: './assets/product-grey-set.png'  },
  'Navy Blue':    { key: 'navy',  swatch: 'swatch-navy',  img: './assets/product-blue-set.png'  },
  'Dusty Pink':   { key: 'pink',  swatch: 'swatch-pink',  img: './assets/product-pink-set.png'  },
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const PRODUCTS = [
  // Terminal — Male Design 1
  { id: 1,  name: 'Terminal Set',  subtitle: 'Relaxed Oversized Fit', gender: 'men',   design: 'Terminal', color: 'Jet Black',    price: 129, img: './assets/product-black-set.png' },
  { id: 2,  name: 'Terminal Set',  subtitle: 'Relaxed Oversized Fit', gender: 'men',   design: 'Terminal', color: 'Heather Grey', price: 129, img: './assets/product-grey-set.png'  },
  { id: 3,  name: 'Terminal Set',  subtitle: 'Relaxed Oversized Fit', gender: 'men',   design: 'Terminal', color: 'Navy Blue',    price: 129, img: './assets/product-blue-set.png'  },
  { id: 4,  name: 'Terminal Set',  subtitle: 'Relaxed Oversized Fit', gender: 'men',   design: 'Terminal', color: 'Dusty Pink',   price: 129, img: './assets/product-pink-set.png'  },
  // Runway — Male Design 2
  { id: 5,  name: 'Runway Set',    subtitle: 'Slim Modern Fit',       gender: 'men',   design: 'Runway',   color: 'Jet Black',    price: 139, img: './assets/product-black-set.png' },
  { id: 6,  name: 'Runway Set',    subtitle: 'Slim Modern Fit',       gender: 'men',   design: 'Runway',   color: 'Heather Grey', price: 139, img: './assets/product-grey-set.png'  },
  { id: 7,  name: 'Runway Set',    subtitle: 'Slim Modern Fit',       gender: 'men',   design: 'Runway',   color: 'Navy Blue',    price: 139, img: './assets/product-blue-set.png'  },
  { id: 8,  name: 'Runway Set',    subtitle: 'Slim Modern Fit',       gender: 'men',   design: 'Runway',   color: 'Dusty Pink',   price: 139, img: './assets/product-pink-set.png'  },
  // Departure — Female Design 1
  { id: 9,  name: 'Departure Set', subtitle: 'Cropped Hoodie + High-Waist Jogger', gender: 'women', design: 'Departure',  color: 'Jet Black',    price: 129, img: './assets/product-black-set.png' },
  { id: 10, name: 'Departure Set', subtitle: 'Cropped Hoodie + High-Waist Jogger', gender: 'women', design: 'Departure',  color: 'Heather Grey', price: 129, img: './assets/product-grey-set.png'  },
  { id: 11, name: 'Departure Set', subtitle: 'Cropped Hoodie + High-Waist Jogger', gender: 'women', design: 'Departure',  color: 'Navy Blue',    price: 129, img: './assets/product-blue-set.png'  },
  { id: 12, name: 'Departure Set', subtitle: 'Cropped Hoodie + High-Waist Jogger', gender: 'women', design: 'Departure',  color: 'Dusty Pink',   price: 129, img: './assets/product-pink-set.png'  },
  // First Class — Female Design 2
  { id: 13, name: 'First Class Set', subtitle: 'Oversized Luxury Fit', gender: 'women', design: 'First Class', color: 'Jet Black',    price: 139, img: './assets/product-black-set.png' },
  { id: 14, name: 'First Class Set', subtitle: 'Oversized Luxury Fit', gender: 'women', design: 'First Class', color: 'Heather Grey', price: 139, img: './assets/product-grey-set.png'  },
  { id: 15, name: 'First Class Set', subtitle: 'Oversized Luxury Fit', gender: 'women', design: 'First Class', color: 'Navy Blue',    price: 139, img: './assets/product-blue-set.png'  },
  { id: 16, name: 'First Class Set', subtitle: 'Oversized Luxury Fit', gender: 'women', design: 'First Class', color: 'Dusty Pink',   price: 139, img: './assets/product-pink-set.png'  },
];

// ── STATE ──────────────────────────────────────────────────
let cart = [];
let currentProductId = null;
let selectedColor = null;
let selectedSize  = null;
let selectedQty   = 1;
let checkoutStep  = 1;
let checkoutShipping = { method: 'standard', cost: 8, label: 'Standard Shipping' };
let lastOrder = null;
let shopFilter = { gender: 'all', design: 'all', color: 'all' };

// ── DOM READY ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initNewsletterForm();
  initThemeToggle();
  updateCartBadge();
});

// ── ROUTER ────────────────────────────────────────────────
function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#home';
  const [base, ...rest] = hash.split('/');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => a.classList.remove('active'));

  const key = base.replace('#', '') || 'home';

  // Highlight nav
  const navLink = document.querySelector(`.nav-links a[href="${base}"], .nav-links a[href="#${key}"]`);
  if (navLink) navLink.classList.add('active');

  // Close mobile menu
  closeMobileMenu();

  // Scroll to top
  window.scrollTo(0, 0);

  if (base === '#home' || base === '') {
    showPage('page-home');
    initHomePage();
  } else if (base === '#shop') {
    showPage('page-shop');
    renderShopPage();
  } else if (base === '#product') {
    const id = parseInt(rest[0]);
    if (!isNaN(id)) {
      currentProductId = id;
      showPage('page-product');
      renderProductPage(id);
    } else {
      navigate('#shop');
    }
  } else if (base === '#cart') {
    showPage('page-cart');
    renderCartPage();
  } else if (base === '#checkout') {
    if (cart.length === 0) { navigate('#cart'); return; }
    showPage('page-checkout');
    renderCheckoutPage();
  } else if (base === '#order-confirmed') {
    showPage('page-order-confirmed');
    renderOrderConfirmed();
  } else if (base === '#about') {
    showPage('page-about');
  } else {
    navigate('#home');
  }
}

function showPage(id) {
  const page = document.getElementById(id);
  if (page) page.classList.add('active');
}

function navigate(hash) {
  window.location.hash = hash;
}

// ── HEADER ────────────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ── THEME TOGGLE ────────────────────────────────────────
let currentTheme = 'dark';

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const mobileBtn = document.getElementById('mobile-theme-toggle');

  function toggleTheme(e) {
    if (e) e.preventDefault();
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    // Update mobile toggle text
    if (mobileBtn) {
      mobileBtn.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
  }

  if (btn) btn.addEventListener('click', toggleTheme);
  if (mobileBtn) {
    mobileBtn.addEventListener('click', toggleTheme);
    mobileBtn.textContent = 'Light Mode';
  }
}

// ── MOBILE MENU ───────────────────────────────────────────
function initMobileMenu() {
  const burger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const burger = document.getElementById('hamburger');
  if (mobileMenu) mobileMenu.classList.remove('open');
  if (burger) burger.classList.remove('open');
  document.body.style.overflow = '';
}

// ── SCROLL ANIMATIONS ────────────────────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

function refreshAnimations() {
  setTimeout(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer.observe(el));
  }, 50);
}

// ── HOME PAGE ────────────────────────────────────────────
function initHomePage() {
  renderFeaturedProducts();
  refreshAnimations();
}

function renderFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  // Pick 4 featured products: one per color
  const featured = [
    PRODUCTS.find(p => p.color === 'Jet Black'    && p.design === 'Runway'),
    PRODUCTS.find(p => p.color === 'Heather Grey' && p.design === 'First Class'),
    PRODUCTS.find(p => p.color === 'Navy Blue'    && p.design === 'Departure'),
    PRODUCTS.find(p => p.color === 'Dusty Pink'   && p.design === 'Terminal'),
  ].filter(Boolean);

  grid.innerHTML = featured.map((p, i) => `
    <div class="product-card fade-up delay-${i+1}" onclick="navigate('#product/${p.id}')">
      <div class="product-card-image">
        <img src="${p.img}" alt="${p.name} in ${p.color}" loading="lazy">
        <div class="product-card-badge">${p.gender === 'men' ? 'Men' : 'Women'}</div>
      </div>
      <div class="product-card-info">
        <div class="product-card-name">${p.design} Hoodie &amp; Jogger Set</div>
        <div class="product-card-subtitle">${p.color}</div>
        <div class="product-card-footer">
          <div class="product-card-price">$${p.price}</div>
          <div class="product-card-swatches">
            ${Object.values(COLOR_MAP).map(c => `<span class="color-dot ${c.swatch}" title="${c.key}"></span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  refreshAnimations();
}

// ── SHOP PAGE ────────────────────────────────────────────
function renderShopPage() {
  renderFilterBar();
  renderProducts();
  refreshAnimations();
}

function renderFilterBar() {
  const bar = document.getElementById('filter-bar');
  if (!bar) return;

  const genders = ['all', 'men', 'women'];
  const designs = ['all', 'Terminal', 'Runway', 'Departure', 'First Class'];
  const colors  = ['all', 'Jet Black', 'Heather Grey', 'Navy Blue', 'Dusty Pink'];

  bar.innerHTML = `
    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
      <span class="label-xs" style="color:var(--muted); margin-right:4px;">Gender</span>
      ${genders.map(g => `
        <button class="filter-btn ${shopFilter.gender === g ? 'active' : ''}"
          onclick="setFilter('gender','${g}')">${g === 'all' ? 'All' : g.charAt(0).toUpperCase()+g.slice(1)}</button>
      `).join('')}
    </div>
    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:8px;">
      <span class="label-xs" style="color:var(--muted); margin-right:4px;">Design</span>
      ${designs.map(d => `
        <button class="filter-btn ${shopFilter.design === d ? 'active' : ''}"
          onclick="setFilter('design','${d}')">${d === 'all' ? 'All' : d}</button>
      `).join('')}
    </div>
    <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-top:8px;">
      <span class="label-xs" style="color:var(--muted); margin-right:4px;">Color</span>
      ${colors.map(c => `
        <button class="filter-btn ${shopFilter.color === c ? 'active' : ''}"
          onclick="setFilter('color','${c}')">${c === 'all' ? 'All' : c}</button>
      `).join('')}
    </div>
  `;
}

function setFilter(type, value) {
  shopFilter[type] = value;
  renderFilterBar();
  renderProducts();
}

function renderProducts() {
  const grid  = document.getElementById('products-grid');
  const count = document.getElementById('product-count');
  if (!grid) return;

  let filtered = PRODUCTS.filter(p => {
    if (shopFilter.gender !== 'all' && p.gender !== shopFilter.gender) return false;
    if (shopFilter.design !== 'all' && p.design !== shopFilter.design) return false;
    if (shopFilter.color  !== 'all' && p.color  !== shopFilter.color)  return false;
    return true;
  });

  if (count) count.textContent = `${filtered.length} Product${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; padding:80px 20px; text-align:center; color:var(--muted);">
      <p style="font-size:0.9rem;">No products match your filters.</p>
      <button class="btn btn-ghost btn-sm" style="margin-top:1rem;" onclick="resetFilters()">Clear Filters</button>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card fade-up delay-${(i % 4) + 1}" onclick="navigate('#product/${p.id}')">
      <div class="product-card-image">
        <img src="${p.img}" alt="${p.name} in ${p.color}" loading="lazy">
        <div class="product-card-badge">${p.gender === 'men' ? 'Men' : 'Women'}</div>
      </div>
      <div class="product-card-info">
        <div class="product-card-name">${p.design} Hoodie &amp; Jogger Set</div>
        <div class="product-card-subtitle">${p.color} · ${p.subtitle}</div>
        <div class="product-card-footer">
          <div class="product-card-price">$${p.price}</div>
          <div class="product-card-swatches">
            ${getDesignColors(p.design, p.gender).map(c =>
              `<span class="color-dot ${COLOR_MAP[c] ? COLOR_MAP[c].swatch : ''}" title="${c}"></span>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  refreshAnimations();
}

function resetFilters() {
  shopFilter = { gender: 'all', design: 'all', color: 'all' };
  renderShopPage();
}

function getDesignColors(design, gender) {
  return PRODUCTS
    .filter(p => p.design === design && p.gender === gender)
    .map(p => p.color);
}

// ── PRODUCT DETAIL PAGE ──────────────────────────────────
function renderProductPage(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) { navigate('#shop'); return; }

  selectedColor = product.color;
  selectedSize  = null;
  selectedQty   = 1;

  // Set breadcrumb
  const bc = document.getElementById('product-breadcrumb');
  if (bc) bc.innerHTML = `
    <a onclick="navigate('#shop')">Shop</a>
    <span>/</span>
    <a onclick="navigate('#shop')">${product.gender === 'men' ? 'Men' : 'Women'}</a>
    <span>/</span>
    <span style="color:var(--cream-dim)">${product.design}</span>
  `;

  // Set title & info
  const pname = document.getElementById('product-name');
  if (pname) pname.textContent = `${product.design} Hoodie & Jogger Set`;

  const ptag = document.getElementById('product-tagline');
  if (ptag) ptag.textContent = `${product.gender === 'men' ? "Men's" : "Women's"} · ${product.subtitle}`;

  const pprice = document.getElementById('product-price');
  if (pprice) pprice.textContent = `$${product.price}`;

  // Set image
  setProductImage(product.img);

  // Render color swatches
  renderColorSwatches(product);

  // Render size buttons
  renderSizeBtns();

  // Set qty
  selectedQty = 1;
  updateQtyDisplay();

  // Render thumbnails
  renderGalleryThumbs(product);

  refreshAnimations();
}

function setProductImage(src) {
  const img = document.getElementById('product-main-img');
  if (!img) return;
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = src;
    img.onload = () => { img.style.opacity = '1'; };
    img.style.opacity = '1';
  }, 150);
}

function renderColorSwatches(product) {
  const wrap = document.getElementById('color-swatches');
  const label = document.getElementById('selected-color-label');
  if (!wrap) return;

  const sameDesign = PRODUCTS.filter(p => p.design === product.design && p.gender === product.gender);

  if (label) label.textContent = selectedColor;

  wrap.innerHTML = sameDesign.map(p => {
    const cm = COLOR_MAP[p.color];
    return `
      <button class="color-swatch ${cm ? cm.swatch : ''} ${p.color === selectedColor ? 'active' : ''}"
        title="${p.color}"
        onclick="selectColor(${p.id},'${p.color}')">
      </button>
    `;
  }).join('');
}

function selectColor(productId, color) {
  navigate(`#product/${productId}`);
}

function renderSizeBtns() {
  const wrap = document.getElementById('size-buttons');
  if (!wrap) return;

  wrap.innerHTML = SIZES.map(s => `
    <button class="size-btn ${selectedSize === s ? 'active' : ''}"
      onclick="selectSize('${s}')">${s}</button>
  `).join('');
}

function selectSize(size) {
  selectedSize = size;
  renderSizeBtns();
}

function updateQtyDisplay() {
  const el = document.getElementById('qty-value');
  if (el) el.textContent = selectedQty;
}

function changeQty(delta) {
  selectedQty = Math.max(1, Math.min(10, selectedQty + delta));
  updateQtyDisplay();
}

function renderGalleryThumbs(product) {
  const thumbs = document.getElementById('gallery-thumbs');
  if (!thumbs) return;

  const sameDesign = PRODUCTS.filter(p => p.design === product.design && p.gender === product.gender);

  thumbs.innerHTML = sameDesign.slice(0, 4).map(p => `
    <div class="gallery-thumb ${p.id === product.id ? 'active' : ''}" onclick="navigate('#product/${p.id}')">
      <img src="${p.img}" alt="${p.color}" loading="lazy">
    </div>
  `).join('');
}

function addToBag() {
  const product = PRODUCTS.find(p => p.id === currentProductId);
  if (!product) return;

  if (!selectedSize) {
    showToast('Please select a size', 'size');
    // Shake size buttons
    const sizeWrap = document.getElementById('size-buttons');
    if (sizeWrap) {
      sizeWrap.style.animation = 'shake 0.4s ease';
      setTimeout(() => { sizeWrap.style.animation = ''; }, 400);
    }
    return;
  }

  const existingIdx = cart.findIndex(item =>
    item.productId === product.id && item.size === selectedSize && item.color === product.color
  );

  if (existingIdx > -1) {
    cart[existingIdx].qty = Math.min(10, cart[existingIdx].qty + selectedQty);
  } else {
    cart.push({
      productId: product.id,
      name: `${product.design} Hoodie & Jogger Set`,
      color: product.color,
      size: selectedSize,
      price: product.price,
      img: product.img,
      qty: selectedQty,
      gender: product.gender,
    });
  }

  updateCartBadge();
  showToast(`Added to bag — ${product.design} · ${product.color} · ${selectedSize}`);
}

// ── CART ─────────────────────────────────────────────────
function updateCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.setAttribute('data-count', totalQty);
    el.textContent = totalQty;
  });
}

function renderCartPage() {
  const container = document.getElementById('cart-items');
  const emptyState = document.getElementById('cart-empty');
  const filledState = document.getElementById('cart-filled');

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (filledState) filledState.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (filledState) filledState.style.display = 'block';

  if (container) {
    container.innerHTML = cart.map((item, idx) => `
      <div class="cart-item" data-idx="${idx}">
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}" loading="lazy">
        </div>
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${item.color} · Size ${item.size}</div>
          <button class="cart-item-remove" onclick="removeFromCart(${idx})">Remove</button>
        </div>
        <div class="cart-qty qty-control">
          <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">−</button>
          <div class="qty-value">${item.qty}</div>
          <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
        </div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
    `).join('');
  }

  updateCartSummary();
}

function updateCartQty(idx, delta) {
  cart[idx].qty = Math.max(1, Math.min(10, cart[idx].qty + delta));
  if (cart[idx].qty === 0) {
    cart.splice(idx, 1);
  }
  updateCartBadge();
  renderCartPage();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  updateCartBadge();
  renderCartPage();
  if (cart.length === 0) {
    showToast('Your bag is empty');
  }
}

function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 200 ? 0 : 8;
  const total = subtotal + shipping;

  const subEl = document.getElementById('cart-subtotal');
  const shipEl = document.getElementById('cart-shipping');
  const totEl = document.getElementById('cart-total');
  const noteEl = document.getElementById('cart-ship-note');

  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shipEl) shipEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
  if (noteEl) {
    if (subtotal >= 200) {
      noteEl.textContent = 'Free shipping applied';
    } else {
      const diff = (200 - subtotal).toFixed(2);
      noteEl.textContent = `Add $${diff} more for free shipping`;
    }
  }
}

// ── CHECKOUT ──────────────────────────────────────────────
function renderCheckoutPage() {
  checkoutStep = 1;
  renderCheckoutSteps();
  renderCheckoutSummary();
  renderShippingOptions();
  updateCheckoutTotal();
}

function renderCheckoutSteps() {
  const stepsEl = document.getElementById('checkout-steps');
  const stepLabels = ['Contact', 'Shipping', 'Delivery', 'Payment'];
  if (!stepsEl) return;

  stepsEl.innerHTML = stepLabels.map((label, i) => {
    const n = i + 1;
    let cls = n < checkoutStep ? 'completed' : n === checkoutStep ? 'active' : '';
    return `
      ${i > 0 ? '<div class="step-connector"></div>' : ''}
      <div class="step-indicator ${cls}">
        <div class="step-number">${n < checkoutStep ? '✓' : n}</div>
        <span class="step-label">${label}</span>
      </div>
    `;
  }).join('');

  // Show active section
  document.querySelectorAll('.checkout-section').forEach(s => s.classList.remove('active'));
  const active = document.getElementById(`checkout-step-${checkoutStep}`);
  if (active) active.classList.add('active');
}

function renderShippingOptions() {
  const wrap = document.getElementById('shipping-options');
  if (!wrap) return;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const freeEligible = subtotal >= 200;

  const options = [
    { value: 'standard', label: 'Standard Shipping', desc: '5–8 business days', price: 8 },
    { value: 'express',  label: 'Express Shipping',  desc: '2–4 business days', price: 15 },
    ...(freeEligible ? [{ value: 'free', label: 'Free Shipping', desc: '7–12 business days', price: 0 }] : []),
  ];

  wrap.innerHTML = options.map(opt => `
    <label class="shipping-option ${checkoutShipping.method === opt.value ? 'selected' : ''}">
      <input type="radio" name="shipping" value="${opt.value}"
        ${checkoutShipping.method === opt.value ? 'checked' : ''}
        onchange="selectShipping('${opt.value}', ${opt.price}, '${opt.label}')">
      <div class="shipping-option-info">
        <div class="shipping-option-name">${opt.label}</div>
        <div class="shipping-option-desc">${opt.desc}</div>
      </div>
      <div class="shipping-option-price">${opt.price === 0 ? 'FREE' : `$${opt.price}`}</div>
    </label>
  `).join('');
}

function selectShipping(method, cost, label) {
  checkoutShipping = { method, cost, label };
  document.querySelectorAll('.shipping-option').forEach(el => el.classList.remove('selected'));
  event.target.closest('.shipping-option').classList.add('selected');
  updateCheckoutTotal();
}

function renderCheckoutSummary() {
  const wrap = document.getElementById('checkout-summary-items');
  if (!wrap) return;

  wrap.innerHTML = cart.map(item => `
    <div class="cs-item">
      <div class="cs-item-img">
        <img src="${item.img}" alt="${item.name}" loading="lazy">
        <div class="cs-item-qty-badge">${item.qty}</div>
      </div>
      <div class="cs-item-info">
        <div class="cs-item-name">${item.name}</div>
        <div class="cs-item-meta">${item.color} · ${item.size}</div>
      </div>
      <div class="cs-item-price">$${(item.price * item.qty).toFixed(2)}</div>
    </div>
  `).join('');

  updateCheckoutTotal();
}

function updateCheckoutTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + checkoutShipping.cost;

  const subEl = document.getElementById('co-subtotal');
  const shipEl = document.getElementById('co-shipping');
  const totEl = document.getElementById('co-total');

  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shipEl) shipEl.textContent = checkoutShipping.cost === 0 ? 'FREE' : `$${checkoutShipping.cost.toFixed(2)}`;
  if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
}

function nextCheckoutStep() {
  if (!validateCheckoutStep(checkoutStep)) return;
  checkoutStep = Math.min(4, checkoutStep + 1);
  renderCheckoutSteps();
  updateCheckoutTotal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevCheckoutStep() {
  checkoutStep = Math.max(1, checkoutStep - 1);
  renderCheckoutSteps();
  updateCheckoutTotal();
}

function validateCheckoutStep(step) {
  const section = document.getElementById(`checkout-step-${step}`);
  if (!section) return true;

  const inputs = section.querySelectorAll('.form-input[required], .form-select[required]');
  let valid = true;

  inputs.forEach(input => {
    input.classList.remove('error');
    const errEl = input.parentElement.querySelector('.form-error-msg');
    if (errEl) errEl.remove();

    if (!input.value.trim()) {
      input.classList.add('error');
      const err = document.createElement('span');
      err.className = 'form-error-msg';
      err.textContent = 'This field is required';
      input.parentElement.appendChild(err);
      valid = false;
    } else if (input.type === 'email' && !input.value.includes('@')) {
      input.classList.add('error');
      const err = document.createElement('span');
      err.className = 'form-error-msg';
      err.textContent = 'Please enter a valid email';
      input.parentElement.appendChild(err);
      valid = false;
    }
  });

  return valid;
}

async function placeOrder() {
  if (!validateCheckoutStep(4)) return;

  const btn = document.getElementById('place-order-btn');
  if (btn) {
    btn.textContent = 'Processing...';
    btn.disabled = true;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const orderData = {
    email:           document.getElementById('co-email')?.value || '',
    phone:           document.getElementById('co-phone')?.value || '',
    first_name:      document.getElementById('co-firstname')?.value || '',
    last_name:       document.getElementById('co-lastname')?.value || '',
    address:         document.getElementById('co-address')?.value || '',
    city:            document.getElementById('co-city')?.value || '',
    country:         document.getElementById('co-country')?.value || '',
    postal_code:     document.getElementById('co-postal')?.value || '',
    shipping_method: checkoutShipping.method,
    shipping_cost:   checkoutShipping.cost,
    subtotal:        subtotal,
    items:           cart.map(item => ({
      name:     item.name,
      color:    item.color,
      size:     item.size,
      qty:      item.qty,
      price:    item.price,
      subtotal: item.price * item.qty,
      img:      item.img,
    })),
  };

  try {
    const res = await fetch(`${CGI_BIN}/api.py?action=place_order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();

    if (data.success) {
      lastOrder = data;
      cart = [];
      updateCartBadge();
      navigate('#order-confirmed');
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (err) {
    // Fallback: simulate order for demo
    lastOrder = {
      order_number: 'AF-' + Date.now().toString().slice(-8).toUpperCase(),
      total: subtotal + checkoutShipping.cost,
      subtotal: subtotal,
      shipping_cost: checkoutShipping.cost,
      shipping_method: checkoutShipping.method,
      email: orderData.email,
      name: `${orderData.first_name} ${orderData.last_name}`.trim(),
      items: orderData.items,
      delivery: {
        label: checkoutShipping.method === 'express' ? 'Express (2-4 business days)' : 'Standard (5-8 business days)',
        estimated_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      },
    };
    cart = [];
    updateCartBadge();
    navigate('#order-confirmed');
  }

  if (btn) { btn.textContent = 'Place Order'; btn.disabled = false; }
}

// ── ORDER CONFIRMED ───────────────────────────────────────
function renderOrderConfirmed() {
  if (!lastOrder) {
    navigate('#home');
    return;
  }

  const numEl = document.getElementById('order-number');
  if (numEl) numEl.innerHTML = `Order <strong>${lastOrder.order_number}</strong>`;

  const box = document.getElementById('order-details-box');
  if (box) {
    box.innerHTML = `
      <div class="confirmed-row">
        <span>Customer</span>
        <strong>${lastOrder.name || lastOrder.email}</strong>
      </div>
      <div class="confirmed-row">
        <span>Email</span>
        <strong>${lastOrder.email}</strong>
      </div>
      <div class="confirmed-row">
        <span>Shipping</span>
        <strong>${lastOrder.delivery?.label || 'Standard Shipping'}</strong>
      </div>
      <div class="confirmed-row">
        <span>Estimated Delivery</span>
        <strong>${lastOrder.delivery?.estimated_date || 'To be confirmed'}</strong>
      </div>
      <div class="confirmed-row">
        <span>Order Total</span>
        <strong>$${parseFloat(lastOrder.total).toFixed(2)}</strong>
      </div>
    `;
  }

  const itemsEl = document.getElementById('order-items');
  if (itemsEl && lastOrder.items) {
    itemsEl.innerHTML = `
      <div style="margin-top:2rem; max-width:480px; margin-left:auto; margin-right:auto; text-align:left;">
        <h4 style="font-size:0.68rem; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); margin-bottom:1rem; text-align:center;">Items Ordered</h4>
        ${lastOrder.items.map(item => `
          <div style="display:flex; justify-content:space-between; padding:0.7rem 0; border-bottom:1px solid var(--border); font-size:0.82rem;">
            <span>${item.name} · ${item.color} · ${item.size} × ${item.qty}</span>
            <span style="color:var(--gold);">$${parseFloat(item.subtotal).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ── SIZE GUIDE MODAL ──────────────────────────────────────
function openSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function switchSizeTab(gender) {
  document.querySelectorAll('.size-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.size-table-wrap').forEach(t => t.classList.remove('active'));
  document.querySelector(`.size-tab[data-gender="${gender}"]`)?.classList.add('active');
  document.getElementById(`size-table-${gender}`)?.classList.add('active');
}

// ── NEWSLETTER ────────────────────────────────────────────
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const msgEl = document.getElementById('newsletter-msg');
    const email = emailInput?.value?.trim();

    if (!email || !email.includes('@')) {
      if (msgEl) { msgEl.textContent = 'Please enter a valid email'; msgEl.style.color = 'var(--error)'; }
      return;
    }

    const btn = form.querySelector('button');
    if (btn) { btn.textContent = 'Subscribing...'; btn.disabled = true; }

    try {
      const res = await fetch(`${CGI_BIN}/api.py?action=newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (msgEl) { msgEl.textContent = data.message || 'Thank you for subscribing!'; msgEl.style.color = 'var(--success)'; }
      if (emailInput) emailInput.value = '';
    } catch {
      if (msgEl) { msgEl.textContent = 'Subscribed! Thank you.'; msgEl.style.color = 'var(--success)'; }
      if (emailInput) emailInput.value = '';
    }

    if (btn) { btn.textContent = 'Subscribe'; btn.disabled = false; }
  });
}

// ── TOAST ────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icon = type === 'size' ? '⚠' : '✓';
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ── SHAKE ANIMATION (inline) ─────────────────────────────
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

// ── OVERLAY CLICK CLOSE ───────────────────────────────────
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeSizeGuide();
  }
});

// ── FORMAT CARD NUMBER ────────────────────────────────────
document.addEventListener('input', (e) => {
  if (e.target.id === 'co-card') {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
  }
  if (e.target.id === 'co-expiry') {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2);
    e.target.value = val;
  }
  if (e.target.id === 'co-cvv') {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  }
});

// Expose globals needed by inline HTML handlers
window.navigate         = navigate;
window.setFilter        = setFilter;
window.resetFilters     = resetFilters;
window.selectColor      = selectColor;
window.selectSize       = selectSize;
window.changeQty        = changeQty;
window.addToBag         = addToBag;
window.removeFromCart   = removeFromCart;
window.updateCartQty    = updateCartQty;
window.nextCheckoutStep = nextCheckoutStep;
window.prevCheckoutStep = prevCheckoutStep;
window.selectShipping   = selectShipping;
window.placeOrder       = placeOrder;
window.openSizeGuide    = openSizeGuide;
window.closeSizeGuide   = closeSizeGuide;
window.switchSizeTab    = switchSizeTab;
