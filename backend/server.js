require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const { usersPath, getUsers, saveUsers } = require('./utils/storage');

const app = express();
const PORT = process.env.PORT || 3000;

async function ensureAdminUser() {
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'kamrasaathi-dev-secret-change-in-production';
    console.warn('Warning: JWT_SECRET not set. Using default dev secret.');
  }

  const email = process.env.ADMIN_EMAIL || 'admin@kamrasaathi.in';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  if (!fs.existsSync(usersPath)) {
    const passwordHash = await bcrypt.hash(password, 10);
    saveUsers([
      {
        id: '1',
        name: 'Admin',
        email,
        passwordHash,
        role: 'admin',
        bookings: [],
      },
    ]);
    console.log(`Default admin created: ${email}`);
  } else {
    const users = getUsers();
    const admin = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (admin && !admin.role) {
      admin.role = 'admin';
      saveUsers(users);
    }
  }
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);

app.use(express.static(path.join(__dirname, '..')));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

app.get('/admin/login', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'login.html'));
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Kamra Saathi Admin API' });
});

ensureAdminUser().then(() => {
  app.listen(PORT, () => {
    console.log(`Kamra Saathi server running at http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin/login.html`);
    console.log(`Homepage: http://localhost:${PORT}/index.html`);
  });
});
