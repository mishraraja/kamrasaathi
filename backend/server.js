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
const configuredFrontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
];
const vercelOriginPattern = /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i;

if (configuredFrontendUrl) {
  allowedOrigins.push(configuredFrontendUrl);
}

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      const isAllowedOrigin = allowedOrigins.includes(normalizedOrigin)
        || vercelOriginPattern.test(normalizedOrigin);

      if (isAllowedOrigin) {
        callback(null, true);
        return;
      }

      console.warn(`Blocked CORS request from: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

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
    console.log(`Kamra Saathi server started on port ${PORT}`);
    console.log(`Admin login route ready at /admin/login.html`);
    console.log(`Health check ready at /api/health`);
  });
});
