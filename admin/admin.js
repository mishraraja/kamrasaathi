const API_BASE_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  return 'https://kamrasaathi-backend.onrender.com/api';
})();

const API = API_BASE_URL;
let content = {};
let token = localStorage.getItem('adminToken');

if (!token) {
  window.location.href = 'login.html';
}

const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
document.getElementById('adminName').textContent = adminUser.name || 'Admin';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

async function apiFetch(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'login.html';
    return;
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadContent() {
  content = await apiFetch('/content');
  renderDashboard();
  populateForms();
  renderTables();
}

function renderDashboard() {
  document.getElementById('dashRooms').textContent = content.rooms?.length || 0;
  document.getElementById('dashActiveRooms').textContent = content.rooms?.filter((r) => r.active).length || 0;
  document.getElementById('dashBlogs').textContent = content.blogs?.length || 0;
  document.getElementById('dashTestimonials').textContent = content.testimonials?.length || 0;
}

function fillForm(formId, data, transforms = {}) {
  const form = document.getElementById(formId);
  if (!form || !data) return;
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (!field) return;
    if (transforms[key]) {
      field.value = transforms[key](value);
    } else if (Array.isArray(value)) {
      field.value = value.join(', ');
    } else {
      field.value = value ?? '';
    }
  });
}

function readForm(formId, transforms = {}) {
  const form = document.getElementById(formId);
  const data = {};
  [...form.elements].forEach((el) => {
    if (!el.name || el.type === 'submit' || el.type === 'button') return;
    if (transforms[el.name]) {
      data[el.name] = transforms[el.name](el);
    } else if (el.type === 'checkbox') {
      data[el.name] = el.checked;
    } else if (el.type === 'number') {
      data[el.name] = Number(el.value);
    } else {
      data[el.name] = el.value;
    }
  });
  return data;
}

function populateForms() {
  fillForm('form-site', content.site);
  fillForm('form-hero', content.hero, { quickTags: (v) => v.join(', ') });
  fillForm('form-featuredRoom', content.featuredRoom, { thumbnails: (v) => v.join(', ') });
  fillForm('form-trust', content.trustBanner);

  renderStatsEditor();
  renderFeaturesEditor();
  renderTrustEditor();
}

function renderStatsEditor() {
  const container = document.getElementById('statsEditor');
  container.innerHTML = (content.stats || []).map((stat, i) => `
    <div class="panel" style="margin-bottom:12px;padding:16px;" data-stat-index="${i}">
      <div class="form-row">
        <div class="form-group"><label>Value</label><input class="stat-value" value="${stat.value}"></div>
        <div class="form-group"><label>Label</label><input class="stat-label" value="${stat.label}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Icon (Font Awesome class)</label><input class="stat-icon" value="${stat.icon}"></div>
        <div class="form-group"><label>Icon Color Class</label><input class="stat-iconClass" value="${stat.iconClass}"></div>
      </div>
    </div>
  `).join('');
}

function renderFeaturesEditor() {
  const container = document.getElementById('featuresEditor');
  container.innerHTML = (content.features || []).map((feat, i) => `
    <div class="panel" style="margin-bottom:12px;padding:16px;" data-feature-index="${i}">
      <div class="form-group"><label>Title</label><input class="feat-title" value="${feat.title}"></div>
      <div class="form-group"><label>Description</label><input class="feat-desc" value="${feat.description}"></div>
      <div class="form-row">
        <div class="form-group"><label>Icon</label><input class="feat-icon" value="${feat.icon}"></div>
        <div class="form-group"><label>Icon Class</label><input class="feat-iconClass" value="${feat.iconClass}"></div>
      </div>
    </div>
  `).join('');
}

function renderTrustEditor() {
  const container = document.getElementById('trustItemsEditor');
  container.innerHTML = (content.trustBanner?.items || []).map((item, i) => `
    <div class="panel" style="margin-bottom:12px;padding:16px;" data-trust-index="${i}">
      <div class="form-row">
        <div class="form-group"><label>Icon</label><input class="trust-icon" value="${item.icon}"></div>
        <div class="form-group"><label>Text</label><input class="trust-text" value="${item.text}"></div>
      </div>
    </div>
  `).join('');
}

function renderTables() {
  const roomsTbody = document.getElementById('roomsTable');
  roomsTbody.innerHTML = (content.rooms || []).map((room) => `
    <tr>
      <td><img src="${room.image}" alt=""></td>
      <td>${room.title}</td>
      <td>₹${room.price.toLocaleString()}</td>
      <td>${room.roomType}</td>
      <td><span class="status-badge ${room.active ? 'status-active' : 'status-inactive'}">${room.active ? 'Active' : 'Inactive'}</span></td>
      <td class="table-actions">
        <button class="btn btn-secondary btn-sm" onclick="editRoom('${room.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteRoom('${room.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  document.getElementById('testimonialsTable').innerHTML = (content.testimonials || []).map((t) => `
    <tr>
      <td><img src="${t.avatar}" alt=""></td>
      <td>${t.name}</td>
      <td>${'⭐'.repeat(t.rating)}</td>
      <td>${t.text.slice(0, 60)}...</td>
      <td class="table-actions">
        <button class="btn btn-secondary btn-sm" onclick="editTestimonial('${t.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${t.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  document.getElementById('blogsTable').innerHTML = (content.blogs || []).map((b) => `
    <tr>
      <td><img src="${b.image}" alt=""></td>
      <td>${b.title}</td>
      <td>${b.link}</td>
      <td><span class="status-badge ${b.active ? 'status-active' : 'status-inactive'}">${b.active ? 'Published' : 'Draft'}</span></td>
      <td class="table-actions">
        <button class="btn btn-secondary btn-sm" onclick="editBlog('${b.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteBlog('${b.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

async function saveSection(section) {
  try {
    let payload;

    if (section === 'hero') {
      const data = readForm('form-hero');
      payload = {
        ...content.hero,
        ...data,
        quickTags: data.quickTags.split(',').map((t) => t.trim()).filter(Boolean),
      };
    } else if (section === 'featuredRoom') {
      const data = readForm('form-featuredRoom');
      payload = {
        ...content.featuredRoom,
        ...data,
        thumbnails: data.thumbnails.split(',').map((t) => t.trim()).filter(Boolean),
      };
    } else if (section === 'stats') {
      payload = [...document.querySelectorAll('[data-stat-index]')].map((el, i) => ({
        ...content.stats[i],
        value: el.querySelector('.stat-value').value,
        label: el.querySelector('.stat-label').value,
        icon: el.querySelector('.stat-icon').value,
        iconClass: el.querySelector('.stat-iconClass').value,
      }));
    } else if (section === 'features') {
      payload = [...document.querySelectorAll('[data-feature-index]')].map((el, i) => ({
        ...content.features[i],
        title: el.querySelector('.feat-title').value,
        description: el.querySelector('.feat-desc').value,
        icon: el.querySelector('.feat-icon').value,
        iconClass: el.querySelector('.feat-iconClass').value,
      }));
    } else {
      payload = readForm(`form-${section}`);
    }

    await apiFetch(`/content/section/${section}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    content[section] = payload;
    showToast(`${section} saved successfully`);
    renderDashboard();
  } catch (err) {
    showToast(err.message);
  }
}

async function saveTrustBanner() {
  try {
    const title = document.querySelector('#form-trust [name="title"]').value;
    const items = [...document.querySelectorAll('[data-trust-index]')].map((el, i) => ({
      ...content.trustBanner.items[i],
      icon: el.querySelector('.trust-icon').value,
      text: el.querySelector('.trust-text').value,
    }));

    const payload = { title, items };
    await apiFetch('/content/section/trustBanner', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    content.trustBanner = payload;
    showToast('Trust banner saved');
  } catch (err) {
    showToast(err.message);
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function openRoomModal(room = null) {
  const form = document.getElementById('roomForm');
  form.reset();
  document.getElementById('roomModalTitle').textContent = room ? 'Edit Room' : 'Add Room';

  if (room) {
    form.elements.id.value = room.id;
    form.elements.title.value = room.title;
    form.elements.price.value = room.price;
    form.elements.distance.value = room.distance;
    form.elements.roomType.value = room.roomType;
    form.elements.image.value = room.image;
    form.elements.tags.value = room.tags.join(', ');
    form.elements.mess.checked = room.mess;
    form.elements.ac.checked = room.ac;
    form.elements.foodIncluded.checked = room.foodIncluded;
    form.elements.verified.checked = room.verified;
    form.elements.active.checked = room.active;
  }

  document.getElementById('roomModal').classList.add('open');
}

function editRoom(id) {
  const room = content.rooms.find((r) => r.id === id);
  if (room) openRoomModal(room);
}

async function deleteRoom(id) {
  if (!confirm('Delete this room listing?')) return;
  try {
    await apiFetch(`/content/rooms/${id}`, { method: 'DELETE' });
    content.rooms = content.rooms.filter((r) => r.id !== id);
    renderTables();
    renderDashboard();
    showToast('Room deleted');
  } catch (err) {
    showToast(err.message);
  }
}

document.getElementById('roomForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.elements.id.value;
  const payload = {
    title: form.elements.title.value,
    price: Number(form.elements.price.value),
    distance: form.elements.distance.value,
    roomType: form.elements.roomType.value,
    image: form.elements.image.value,
    tags: form.elements.tags.value.split(',').map((t) => t.trim()).filter(Boolean),
    mess: form.elements.mess.checked,
    ac: form.elements.ac.checked,
    foodIncluded: form.elements.foodIncluded.checked,
    verified: form.elements.verified.checked,
    active: form.elements.active.checked,
  };

  try {
    if (id) {
      const updated = await apiFetch(`/content/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      content.rooms = content.rooms.map((r) => (r.id === id ? updated : r));
    } else {
      const created = await apiFetch('/content/rooms', { method: 'POST', body: JSON.stringify(payload) });
      content.rooms.push(created);
    }
    closeModal('roomModal');
    renderTables();
    renderDashboard();
    showToast('Room saved');
  } catch (err) {
    showToast(err.message);
  }
});

function openTestimonialModal(item = null) {
  const form = document.getElementById('testimonialForm');
  form.reset();
  document.getElementById('testimonialModalTitle').textContent = item ? 'Edit Testimonial' : 'Add Testimonial';
  if (item) {
    form.elements.id.value = item.id;
    form.elements.name.value = item.name;
    form.elements.avatar.value = item.avatar;
    form.elements.rating.value = item.rating;
    form.elements.text.value = item.text;
  }
  document.getElementById('testimonialModal').classList.add('open');
}

function editTestimonial(id) {
  const item = content.testimonials.find((t) => t.id === id);
  if (item) openTestimonialModal(item);
}

async function deleteTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  try {
    await apiFetch(`/content/testimonials/${id}`, { method: 'DELETE' });
    content.testimonials = content.testimonials.filter((t) => t.id !== id);
    renderTables();
    renderDashboard();
    showToast('Testimonial deleted');
  } catch (err) {
    showToast(err.message);
  }
}

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.elements.id.value;
  const payload = {
    name: form.elements.name.value,
    avatar: form.elements.avatar.value,
    rating: Number(form.elements.rating.value),
    text: form.elements.text.value,
  };

  try {
    if (id) {
      const updated = await apiFetch(`/content/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      content.testimonials = content.testimonials.map((t) => (t.id === id ? updated : t));
    } else {
      const created = await apiFetch('/content/testimonials', { method: 'POST', body: JSON.stringify(payload) });
      content.testimonials.push(created);
    }
    closeModal('testimonialModal');
    renderTables();
    renderDashboard();
    showToast('Testimonial saved');
  } catch (err) {
    showToast(err.message);
  }
});

function openBlogModal(item = null) {
  const form = document.getElementById('blogForm');
  form.reset();
  document.getElementById('blogModalTitle').textContent = item ? 'Edit Blog' : 'Add Blog';
  if (item) {
    form.elements.id.value = item.id;
    form.elements.title.value = item.title;
    form.elements.image.value = item.image;
    form.elements.link.value = item.link;
    form.elements.active.checked = item.active;
  }
  document.getElementById('blogModal').classList.add('open');
}

function editBlog(id) {
  const item = content.blogs.find((b) => b.id === id);
  if (item) openBlogModal(item);
}

async function deleteBlog(id) {
  if (!confirm('Delete this blog post?')) return;
  try {
    await apiFetch(`/content/blogs/${id}`, { method: 'DELETE' });
    content.blogs = content.blogs.filter((b) => b.id !== id);
    renderTables();
    renderDashboard();
    showToast('Blog deleted');
  } catch (err) {
    showToast(err.message);
  }
}

document.getElementById('blogForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const id = form.elements.id.value;
  const payload = {
    title: form.elements.title.value,
    image: form.elements.image.value,
    link: form.elements.link.value,
    active: form.elements.active.checked,
  };

  try {
    if (id) {
      const updated = await apiFetch(`/content/blogs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      content.blogs = content.blogs.map((b) => (b.id === id ? updated : b));
    } else {
      const created = await apiFetch('/content/blogs', { method: 'POST', body: JSON.stringify(payload) });
      content.blogs.push(created);
    }
    closeModal('blogModal');
    renderTables();
    renderDashboard();
    showToast('Blog saved');
  } catch (err) {
    showToast(err.message);
  }
});

document.querySelectorAll('.nav-item[data-section]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.section-panel').forEach((p) => p.classList.remove('active'));
    document.getElementById(`panel-${btn.dataset.section}`).classList.add('active');
    document.getElementById('pageTitle').textContent = btn.textContent.trim();
  });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = 'login.html';
});

loadContent().catch((err) => showToast(err.message));
