const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');
const { getUsers, saveUsers, getContent } = require('../utils/storage');

const router = express.Router();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function normalizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'admin',
    bookings: user.bookings || [],
  };
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'admin',
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const users = getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: generateId(),
    name,
    email,
    passwordHash,
    role: 'user',
    bookings: [],
  };

  users.push(user);
  saveUsers(users);

  const token = createToken(user);
  return res.status(201).json({
    token,
    user: normalizeUser(user),
    admin: normalizeUser(user),
    message: 'Registration successful',
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(user);
  const profile = normalizeUser(user);

  res.json({
    token,
    user: profile,
    admin: profile,
    role: profile.role,
  });
});

router.get('/me', authMiddleware, (req, res) => {
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const profile = normalizeUser(user);
  res.json({ user: profile, admin: profile });
});

router.get('/my-bookings', authMiddleware, (req, res) => {
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ bookings: user.bookings || [] });
});

router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  saveUsers(users);

  res.json({ message: 'Password updated successfully' });
});

router.post('/book-room', authMiddleware, (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: 'roomId is required' });
  }

  const content = getContent();
  const room = content.rooms?.find((item) => item.id === roomId && item.active);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const bookings = user.bookings || [];
  const alreadyBooked = bookings.find((booking) => booking.roomId === roomId);
  if (alreadyBooked) {
    return res.json({ message: 'Room already booked', booking: alreadyBooked });
  }

  const booking = {
    id: generateId(),
    roomId,
    roomTitle: room.title,
    bookedAt: new Date().toISOString(),
  };

  bookings.push(booking);
  user.bookings = bookings;
  saveUsers(users);

  return res.status(201).json({ message: 'Room booked successfully', booking });
});

module.exports = router;
