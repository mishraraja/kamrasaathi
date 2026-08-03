const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getContent, saveContent } = require('../utils/storage');

const router = express.Router();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

router.get('/', (_req, res) => {
  res.json(getContent());
});

router.put('/', authMiddleware, (req, res) => {
  const content = req.body;
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Invalid content payload' });
  }
  saveContent(content);
  res.json({ message: 'Content updated successfully', content });
});

router.patch('/section/:section', authMiddleware, (req, res) => {
  const { section } = req.params;
  const content = getContent();

  if (!(section in content)) {
    return res.status(404).json({ error: `Section "${section}" not found` });
  }

  content[section] = req.body;
  saveContent(content);
  res.json({ message: `${section} updated`, data: content[section] });
});

router.post('/rooms', authMiddleware, (req, res) => {
  const content = getContent();
  const room = { id: generateId(), verified: true, active: true, ...req.body };
  content.rooms.push(room);
  saveContent(content);
  res.status(201).json(room);
});

router.put('/rooms/:id', authMiddleware, (req, res) => {
  const content = getContent();
  const index = content.rooms.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Room not found' });

  content.rooms[index] = { ...content.rooms[index], ...req.body, id: req.params.id };
  saveContent(content);
  res.json(content.rooms[index]);
});

router.delete('/rooms/:id', authMiddleware, (req, res) => {
  const content = getContent();
  const before = content.rooms.length;
  content.rooms = content.rooms.filter((r) => r.id !== req.params.id);
  if (content.rooms.length === before) {
    return res.status(404).json({ error: 'Room not found' });
  }
  saveContent(content);
  res.json({ message: 'Room deleted' });
});

router.post('/testimonials', authMiddleware, (req, res) => {
  const content = getContent();
  const item = { id: generateId(), rating: 5, ...req.body };
  content.testimonials.push(item);
  saveContent(content);
  res.status(201).json(item);
});

router.post('/reviews', authMiddleware, (req, res) => {
  const { roomId, rating, text } = req.body;
  if (!roomId || !rating || !text) {
    return res.status(400).json({ error: 'roomId, rating and text are required' });
  }

  const content = getContent();
  const room = content.rooms?.find((item) => item.id === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const { getUsers } = require('../utils/storage');
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const hasBookedRoom = (user.bookings || []).some((booking) => booking.roomId === roomId);
  if (!hasBookedRoom) {
    return res.status(403).json({ error: 'Only users who booked this room can leave a review' });
  }

  const item = {
    id: generateId(),
    name: user.name,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`,
    rating: Number(rating),
    text,
    roomId,
    userId: user.id,
  };

  content.testimonials.push(item);
  saveContent(content);
  res.status(201).json(item);
});

router.put('/testimonials/:id', authMiddleware, (req, res) => {
  const content = getContent();
  const index = content.testimonials.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Testimonial not found' });

  content.testimonials[index] = { ...content.testimonials[index], ...req.body, id: req.params.id };
  saveContent(content);
  res.json(content.testimonials[index]);
});

router.delete('/testimonials/:id', authMiddleware, (req, res) => {
  const content = getContent();
  content.testimonials = content.testimonials.filter((t) => t.id !== req.params.id);
  saveContent(content);
  res.json({ message: 'Testimonial deleted' });
});

router.post('/blogs', authMiddleware, (req, res) => {
  const content = getContent();
  const item = { id: generateId(), active: true, link: '#', ...req.body };
  content.blogs.push(item);
  saveContent(content);
  res.status(201).json(item);
});

router.put('/blogs/:id', authMiddleware, (req, res) => {
  const content = getContent();
  const index = content.blogs.findIndex((b) => b.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Blog not found' });

  content.blogs[index] = { ...content.blogs[index], ...req.body, id: req.params.id };
  saveContent(content);
  res.json(content.blogs[index]);
});

router.delete('/blogs/:id', authMiddleware, (req, res) => {
  const content = getContent();
  content.blogs = content.blogs.filter((b) => b.id !== req.params.id);
  saveContent(content);
  res.json({ message: 'Blog deleted' });
});

module.exports = router;
