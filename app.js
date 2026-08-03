const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  return 'https://kamrasaathi-backend.onrender.com/api';
})();

const API = `${API_BASE_URL}/content`;
const AUTH_API = `${API_BASE_URL}/auth`;

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function renderHeroTitle(title, highlight) {
  if (!highlight || !title.includes(highlight)) {
    return title;
  }
  return title.replace(highlight, `<span class="highlight">${highlight}</span>`);
}

function renderSite(site) {
  document.querySelectorAll('.brand-name').forEach((el) => { el.textContent = site.brandName; });
  const tagline = document.querySelector('.logo-text .tagline');
  if (tagline) tagline.textContent = site.tagline;

  const phone = document.querySelector('.nav-actions .phone');
  if (phone) phone.innerHTML = `<i class="fa-solid fa-phone"></i> ${site.phone}`;

  const footerSupport = document.querySelector('.footer-support');
  if (footerSupport) {
    footerSupport.innerHTML = `
      <h4>Support</h4>
      <p>${site.email}</p>
      <p>${site.phone}</p>
      <p>${site.supportHours}</p>
    `;
  }

  const whatsapp = document.querySelector('.whatsapp-float');
  if (whatsapp && site.whatsapp) {
    const num = site.whatsapp.replace(/\D/g, '');
    whatsapp.href = `https://wa.me/${num}`;
  }
}

function renderHero(hero) {
  const titleEl = document.querySelector('.hero-title');
  if (titleEl) titleEl.innerHTML = renderHeroTitle(hero.title, hero.titleHighlight);

  const subtitle = document.querySelector('.hero-subtitle');
  if (subtitle) subtitle.textContent = hero.subtitle;

  const searchInput = document.querySelector('.search-bar input');
  if (searchInput) searchInput.placeholder = hero.searchPlaceholder;

  const tagsContainer = document.querySelector('.quick-tags');
  if (tagsContainer) {
    tagsContainer.innerHTML = hero.quickTags.map((tag) => `<span class="tag">${tag}</span>`).join('');
  }

  const badgeTop = document.querySelector('.badge-top');
  if (badgeTop) badgeTop.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${hero.badgeText}`;

  const heroImg = document.querySelector('.hero-img');
  if (heroImg) heroImg.src = hero.heroImage;

  const badgeBottom = document.querySelector('.badge-bottom');
  if (badgeBottom) {
    badgeBottom.innerHTML = `
      <div class="avatar-group">
        <span class="avatar">👨</span>
        <span class="avatar">👩</span>
        <span class="avatar">🧑</span>
      </div>
      <div>
        <strong>${hero.studentsSettled}</strong><br>
        <small>${hero.studentsLabel}</small>
      </div>
    `;
  }
}

function renderStats(stats) {
  const section = document.querySelector('.stats-section');
  if (!section) return;
  section.innerHTML = stats.map((stat) => `
    <div class="stat-card">
      <div class="stat-icon ${stat.iconClass}"><i class="fa-solid ${stat.icon}"></i></div>
      <div><h3>${stat.value}</h3><p>${stat.label}</p></div>
    </div>
  `).join('');
}

function renderFeatures(features) {
  const grid = document.querySelector('.features-grid');
  if (!grid) return;
  grid.innerHTML = features.map((feat) => `
    <div class="feature-card">
      <div class="feature-icon ${feat.iconClass}"><i class="fa-solid ${feat.icon}"></i></div>
      <div><h4>${feat.title}</h4><p>${feat.description}</p></div>
    </div>
  `).join('');
}

function renderFilters(filters) {
  const group = document.querySelector('.filter-group');
  if (!group || !filters) return;
  group.innerHTML = `
    <label><i class="fa-solid fa-tag"></i> Price ₹${filters.priceMin} - ₹${filters.priceMax}</label>
    <label><i class="fa-solid fa-house"></i> ${filters.roomTypes.join(' / ')}</label>
    <label><i class="fa-solid fa-utensils"></i> Mess Available</label>
    <label><i class="fa-solid fa-bowl-food"></i> ${filters.foodOptions.join(' / ')}</label>
    <label><i class="fa-solid fa-couch"></i> ${filters.furnishingOptions.join(' / ')}</label>
    <label><i class="fa-solid fa-snowflake"></i> ${filters.acOptions.join(' / ')}</label>
  `;
}

function renderRooms(rooms) {
  const grid = document.querySelector('.rooms-grid');
  if (!grid) return;
  const activeRooms = rooms.filter((r) => r.active);

  grid.innerHTML = activeRooms.map((room) => `
    <div class="room-card">
      <div class="card-img-wrapper">
        ${room.verified ? '<span class="badge-verified">Verified</span>' : ''}
        <img src="${room.image}" alt="${room.title}">
      </div>
      <div class="card-body">
        <h4>${room.title}</h4>
        <p class="distance">${room.distance}</p>
        <p class="price"><strong>${formatPrice(room.price)}</strong> /month</p>
        <div class="tags">${room.tags.map((t) => `<span>${t}</span>`).join('')}</div>
        <div class="card-actions">
          <button class="btn btn-purple btn-sm" type="button">View Details</button>
          <button class="btn btn-light btn-sm" type="button">Compare</button>
          <button class="btn btn-dark btn-sm btn-book-room" type="button" data-room-id="${room.id}">Book Room</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCompare(rooms) {
  const activeRooms = rooms.filter((r) => r.active).slice(0, 2);
  if (activeRooms.length < 2) return;

  const [r1, r2] = activeRooms;
  const thead = document.querySelector('.compare-table thead tr');
  if (thead) {
    thead.innerHTML = `
      <th>Feature</th>
      <th>${r1.title}</th>
      <th>${r2.title}</th>
    `;
  }

  const tbody = document.querySelector('.compare-table tbody');
  if (!tbody) return;

  const yesNo = (val) => val
    ? '<span class="status-yes">Yes</span>'
    : '<span class="status-no">No</span>';

  tbody.innerHTML = `
    <tr>
      <td class="feature-name">Rent</td>
      <td class="highlight-val">${formatPrice(r1.price)}</td>
      <td>${formatPrice(r2.price)}</td>
    </tr>
    <tr>
      <td class="feature-name">Distance</td>
      <td>${r1.distance.replace(' away', '')}</td>
      <td>${r2.distance.replace(' away', '')}</td>
    </tr>
    <tr>
      <td class="feature-name">Room Type</td>
      <td><span class="pill">${r1.roomType}</span></td>
      <td><span class="pill">${r2.roomType}</span></td>
    </tr>
    <tr>
      <td class="feature-name">Mess</td>
      <td>${r1.mess ? '<span class="status-yes">Included</span>' : '<span class="status-no">No</span>'}</td>
      <td>${r2.mess ? '<span class="status-yes">Included</span>' : '<span class="status-no">No</span>'}</td>
    </tr>
    <tr>
      <td class="feature-name">AC</td>
      <td>${yesNo(r1.ac)}</td>
      <td>${yesNo(r2.ac)}</td>
    </tr>
    <tr>
      <td class="feature-name">Food Included</td>
      <td>${yesNo(r1.foodIncluded)}</td>
      <td>${yesNo(r2.foodIncluded)}</td>
    </tr>
  `;
}

function renderFeaturedRoom(featured) {
  if (!featured) return;

  const gallery = document.querySelector('.details-gallery');
  if (gallery) {
    gallery.innerHTML = `
      <div class="main-img-box">
        <img src="${featured.mainImage}" alt="Main Room View">
      </div>
      <div class="thumb-group">
        ${featured.thumbnails.map((url) => `<img src="${url}" alt="Room view">`).join('')}
      </div>
    `;
  }

  const info = document.querySelector('.details-info');
  if (info) {
    info.innerHTML = `
      <p class="location-text"><i class="fa-solid fa-location-dot"></i> ${featured.location}</p>
      <div class="info-row">
        <i class="fa-solid fa-house"></i>
        <span><strong>Rent:</strong> ${formatPrice(featured.rent)} <small>/month</small></span>
      </div>
      <div class="info-row">
        <i class="fa-solid fa-utensils"></i>
        <span><strong>Mess Charges:</strong> ${formatPrice(featured.messCharges)}</span>
      </div>
      <div class="info-row align-start">
        <i class="fa-solid fa-list-check"></i>
        <span><strong>Amenities:</strong> ${featured.amenities}</span>
      </div>
      <button class="btn btn-purple btn-full"><i class="fa-solid fa-paper-plane"></i> Contact Team</button>
    `;
  }
}

function renderTestimonials(testimonials) {
  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;
  grid.innerHTML = testimonials.map((t) => `
    <div class="testimonial-card">
      <div class="user-header">
        <img src="${t.avatar}" alt="${t.name}" class="avatar-img">
        <div class="user-meta">
          <h5 class="user-name">${t.name}</h5>
          <div class="stars">${'⭐'.repeat(t.rating)}</div>
        </div>
      </div>
      <p class="review-text">"${t.text}"</p>
    </div>
  `).join('');
}

function renderBlogs(blogs) {
  const grid = document.querySelector('.blogs-grid');
  if (!grid) return;
  const activeBlogs = blogs.filter((b) => b.active);
  grid.innerHTML = activeBlogs.map((blog) => `
    <div class="blog-card">
      <div class="blog-img-box">
        <img src="${blog.image}" alt="${blog.title}">
      </div>
      <h5 class="blog-title">${blog.title}</h5>
      <a href="${blog.link}" class="read-more">Read More &rarr;</a>
    </div>
  `).join('');
}

function renderTrustBanner(trust) {
  if (!trust) return;
  const title = document.querySelector('.trust-title');
  if (title) title.textContent = trust.title;

  const list = document.querySelector('.trust-features-list');
  if (list) {
    list.innerHTML = trust.items.map((item) => `
      <div class="trust-item">
        <div class="trust-icon-box"><i class="fa-solid ${item.icon}"></i></div>
        <p>${item.text}</p>
      </div>
    `).join('');
  }
}

function getToken() {
  return localStorage.getItem('kamraSaathiToken');
}

function clearAuthSession(showMessage = false) {
  localStorage.removeItem('kamraSaathiToken');
  localStorage.removeItem('kamraSaathiUser');
  setAuthState(null);

  if (showMessage && document.getElementById('authMessage')) {
    document.getElementById('authMessage').textContent = 'Logged out';
  }

  if (document.getElementById('reviewRoomSelect')) {
    document.getElementById('reviewRoomSelect').innerHTML = '<option value="">No booked rooms yet</option>';
  }
}

function setAuthState(user) {
  const guestAuthActions = document.getElementById('guestAuthActions');
  const userMenu = document.getElementById('userMenu');
  const authBadge = document.getElementById('authUserBadge');
  const reviewForm = document.getElementById('reviewForm');
  const reviewMessage = document.getElementById('reviewMessage');

  if (user) {
    guestAuthActions.style.display = 'none';
    userMenu.style.display = 'flex';
    authBadge.textContent = `Hi, ${user.name}`;
    reviewForm.style.display = 'block';
    reviewMessage.textContent = 'Book a room and share your experience.';
  } else {
    guestAuthActions.style.display = 'flex';
    userMenu.style.display = 'none';
    if (reviewForm) reviewForm.style.display = 'none';
    if (reviewMessage) reviewMessage.textContent = 'Login and book a room to leave a review.';
  }
}

async function initializeAuthSession() {
  const token = getToken();
  const storedUser = localStorage.getItem('kamraSaathiUser');

  if (!token) {
    if (storedUser) {
      clearAuthSession(false);
    } else {
      setAuthState(null);
    }
    return;
  }

  try {
    const res = await fetchWithAuth(`${AUTH_API}/me`);
    if (!res.ok) {
      throw new Error('Session invalid');
    }

    const data = await res.json();
    localStorage.setItem('kamraSaathiUser', JSON.stringify(data.user));
    setAuthState(data.user);
  } catch (error) {
    console.warn('Auth session invalid, clearing local state:', error);
    clearAuthSession(false);
  }
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

async function loadHomepage() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error('Failed to load content');
    const data = await res.json();

    document.title = `${data.site.brandName} - Find Verified Rooms & PGs`;

    renderSite(data.site);
    renderHero(data.hero);
    renderStats(data.stats);
    renderFeatures(data.features);
    renderFilters(data.filters);
    renderRooms(data.rooms);
    renderCompare(data.rooms);
    renderFeaturedRoom(data.featuredRoom);
    renderTestimonials(data.testimonials);
    renderBlogs(data.blogs);
    renderTrustBanner(data.trustBanner);

    await initializeAuthSession();
    await loadUserBookings();
  } catch (err) {
    console.error('Homepage load error:', err);
  }
}

async function loadUserBookings() {
  const token = getToken();
  const reviewRoomSelect = document.getElementById('reviewRoomSelect');
  if (!token || !reviewRoomSelect) return;

  try {
    const res = await fetchWithAuth(`${AUTH_API}/my-bookings`);
    if (!res.ok) throw new Error('Unable to load bookings');
    const data = await res.json();
    const bookings = data.bookings || [];

    reviewRoomSelect.innerHTML = bookings.length
      ? bookings.map((booking) => `<option value="${booking.roomId}">${booking.roomTitle}</option>`).join('')
      : '<option value="">No booked rooms yet</option>';

    const reviewForm = document.getElementById('reviewForm');
    reviewForm.style.display = bookings.length ? 'block' : 'none';
  } catch (err) {
    console.error('Bookings load error:', err);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value,
  };

  const res = await fetch(`${AUTH_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  const message = document.getElementById('authMessage');

  if (!res.ok) {
    message.textContent = data.error || 'Registration failed';
    return;
  }

  localStorage.setItem('kamraSaathiToken', data.token);
  localStorage.setItem('kamraSaathiUser', JSON.stringify(data.user));
  message.textContent = data.message || 'Registration successful';
  setAuthState(data.user);
  await loadUserBookings();
  form.reset();
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {
    email: form.email.value.trim(),
    password: form.password.value,
  };

  const res = await fetch(`${AUTH_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  const message = document.getElementById('authMessage');

  if (!res.ok) {
    message.textContent = data.error || 'Login failed';
    return;
  }

  localStorage.setItem('kamraSaathiToken', data.token);
  localStorage.setItem('kamraSaathiUser', JSON.stringify(data.user));
  message.textContent = 'Login successful';
  setAuthState(data.user);
  await loadUserBookings();
  form.reset();
}

function handleLogout() {
  clearAuthSession(true);
}

async function handleChangePassword(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const currentPassword = form.currentPassword.value;
  const newPassword = form.newPassword.value;

  if (!getToken()) {
    document.getElementById('changePasswordMessage').textContent = 'Login first to change your password.';
    return;
  }

  if (newPassword.length < 6) {
    document.getElementById('changePasswordMessage').textContent = 'New password must be at least 6 characters.';
    return;
  }

  const res = await fetchWithAuth(`${AUTH_API}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  const msg = document.getElementById('changePasswordMessage');

  if (!res.ok) {
    msg.textContent = data.error || 'Password update failed';
    return;
  }

  msg.textContent = data.message || 'Password updated successfully';
  form.reset();
}

async function bookRoom(roomId) {
  if (!getToken()) {
    document.getElementById('authMessage').textContent = 'Please login before booking a room.';
    return;
  }

  const res = await fetchWithAuth(`${AUTH_API}/book-room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  });
  const data = await res.json();

  if (!res.ok) {
    document.getElementById('authMessage').textContent = data.error || 'Booking failed';
    return;
  }

  document.getElementById('authMessage').textContent = data.message || 'Room booked successfully';
  await loadUserBookings();
}

async function submitReview(event) {
  event.preventDefault();
  const token = getToken();
  if (!token) {
    document.getElementById('reviewMessage').textContent = 'Please login to review.';
    return;
  }

  const roomId = document.getElementById('reviewRoomSelect').value;
  const rating = document.getElementById('reviewRating').value;
  const text = document.getElementById('reviewText').value.trim();

  const res = await fetchWithAuth(`${API}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, rating, text }),
  });
  const data = await res.json();

  if (!res.ok) {
    document.getElementById('reviewMessage').textContent = data.error || 'Review failed';
    return;
  }

  document.getElementById('reviewMessage').textContent = 'Review submitted successfully';
  document.getElementById('reviewForm').reset();

  const testimonialsRes = await fetch(API);
  const testimonialsData = await testimonialsRes.json();
  renderTestimonials(testimonialsData.testimonials);
}

function attachHomepageHandlers() {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const logoutButton = document.getElementById('logoutButton');
  const reviewForm = document.getElementById('reviewForm');
  const changePasswordButton = document.getElementById('changePasswordButton');
  const changePasswordForm = document.getElementById('changePasswordForm');

  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  if (reviewForm) reviewForm.addEventListener('submit', submitReview);
  if (changePasswordButton) changePasswordButton.addEventListener('click', () => openChangePasswordModal());
  if (changePasswordForm) changePasswordForm.addEventListener('submit', handleChangePassword);

  document.querySelectorAll('.btn-book-room').forEach((button) => {
    button.addEventListener('click', () => {
      const roomId = button.dataset.roomId;
      if (roomId) {
        bookRoom(roomId);
      }
    });
  });
}

loadHomepage().finally(() => {
  attachHomepageHandlers();
});
