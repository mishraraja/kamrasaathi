# Kamra Saathi

Student housing platform with a static homepage and admin backend.

## Project Structure

```
kamrasaathi/
├── index.html          # Public homepage
├── style.css           # Homepage styles
├── admin/              # Admin panel UI
│   ├── login.html
│   ├── index.html
│   ├── admin.css
│   └── admin.js
└── backend/            # Express API server
    ├── server.js
    ├── routes/
    ├── data/
    └── ...
```

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment (optional)

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Default admin credentials:
- **Email:** admin@kamrasaathi.in
- **Password:** admin123

### 3. Start the server

```bash
npm start
```

### 4. Open in browser

- **Homepage:** http://localhost:3000/index.html
- **Admin Login:** http://localhost:3000/admin/login.html
- **Admin Dashboard:** http://localhost:3000/admin/index.html

## Admin Panel Features

The admin panel lets you manage all homepage content:

| Section | What you can edit |
|---------|-------------------|
| Site Settings | Brand, phone, email, support hours |
| Hero | Title, subtitle, tags, hero image |
| Stats | 4 homepage stat cards |
| Features | Smart search feature cards |
| Rooms | Add, edit, delete room listings |
| Featured Room | Room details section |
| Testimonials | Student reviews |
| Blogs | Blog posts |
| Trust Banner | Trust section content |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Admin login |
| GET | `/api/content` | No | Get all homepage content |
| PUT | `/api/content` | Yes | Replace all content |
| PATCH | `/api/content/section/:section` | Yes | Update one section |
| POST/PUT/DELETE | `/api/content/rooms/:id?` | Yes | Manage rooms |
| POST/PUT/DELETE | `/api/content/testimonials/:id?` | Yes | Manage testimonials |
| POST/PUT/DELETE | `/api/content/blogs/:id?` | Yes | Manage blogs |

## Next Steps

Connect the public `index.html` to fetch content from `/api/content` so admin changes appear live on the homepage.
