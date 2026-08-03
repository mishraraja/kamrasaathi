# Kamra Saathi

Kamra Saathi is a student housing discovery platform that lets users browse verified rooms and PGs, compare listings, and book rooms, while admins manage the homepage content from a dashboard.

## Overview

This project combines:

- A public landing page and room listing experience in the root frontend
- A secure Express backend with JWT-based authentication
- A content management admin panel to update homepage sections
- JSON-based persistence for content and user data

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Auth: JWT + bcryptjs
- Storage: Local JSON files in the backend data folder

## Project Structure

```text
kamrasaathi/
├── index.html              # Public homepage
├── style.css               # Homepage styles
├── app.js                  # Public UI rendering logic
├── admin/                  # Admin dashboard UI
│   ├── index.html
│   ├── login.html
│   ├── admin.css
│   └── admin.js
└── backend/
    ├── server.js           # Express server entry point
    ├── package.json
    ├── data/
    │   ├── content.json    # Homepage content source
    │   └── users.json      # Users and bookings data
    ├── middleware/
    ├── routes/
    └── utils/
```

## Features

### Public website

- Hero section with search and quick tags
- Smart search feature cards
- Room listing grid with verified badges
- Compare section for room options
- Featured room / property details panel
- Testimonials and blog sections
- User login, registration, and room booking flow

### Admin panel

Admins can manage:

- Site settings
- Hero content
- Stats cards
- Smart features
- Room listings
- Featured room block
- Testimonials
- Blogs
- Trust banner content

## Run the Project

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Start the server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 3. Open the app

- Homepage: http://localhost:3000/
- Admin login: http://localhost:3000/admin/login.html
- Admin dashboard: http://localhost:3000/admin/index.html

## Default Admin Credentials

The backend auto-creates an admin user on first run if needed.

- Email: admin@kamrasaathi.in
- Password: admin123

> You can override these values with environment variables such as `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET`.

## API Summary

The backend exposes the following use cases:

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | Yes | Get logged-in user profile |
| GET | `/api/auth/my-bookings` | Yes | Get booked rooms |
| POST | `/api/auth/book-room` | Yes | Book a room |
| GET | `/api/content` | No | Fetch homepage content |
| PATCH | `/api/content/section/:section` | Yes | Update one content section |
| POST | `/api/content/rooms` | Yes | Create room listing |
| PUT | `/api/content/rooms/:id` | Yes | Update room listing |
| DELETE | `/api/content/rooms/:id` | Yes | Delete room listing |
| POST | `/api/content/testimonials` | Yes | Create testimonial |
| PUT | `/api/content/testimonials/:id` | Yes | Update testimonial |
| DELETE | `/api/content/testimonials/:id` | Yes | Delete testimonial |
| POST | `/api/content/blogs` | Yes | Create blog |
| PUT | `/api/content/blogs/:id` | Yes | Update blog |
| DELETE | `/api/content/blogs/:id` | Yes | Delete blog |
| GET | `/api/health` | No | Health check |

## Data Files

The backend stores its data in local JSON files:

- `backend/data/content.json` — all public homepage content
- `backend/data/users.json` — authentication users and booking records

## Notes

- The frontend is served statically by the Express server.
- The admin panel writes to the same content configuration used by the frontend.
- The project is intended as a lightweight CMS-style student housing website rather than a full production-grade multi-service platform.

