# TaskFlow — Todo Application

A full-stack todo application with a React frontend and Node.js/Express backend.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite, CSS Modules |
| Backend | Node.js, Express.js |
| Persistence | JSON file (`todos.json`) |

---

## Project Structure

```
todo-app/
├── frontend/          # React + Vite app (port 5173)
│   └── src/
│       ├── pages/
│       │   ├── TodoList.jsx      # Page 1 — all todos
│       │   └── TodoDetail.jsx    # Page 2 — single todo (?id=...)
│       ├── components/
│       │   └── TodoForm.jsx      # Create / edit form
│       └── api/
│           └── todos.js          # Axios API helpers
├── backend/           # Express REST API (port 3001)
│   ├── server.js
│   └── todos.json     # Flat-file data store
└── docs/
    ├── api.md         # API reference
    └── features.md    # Feature documentation
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install
node server.js
# API running at http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

The Vite dev server proxies `/todos` and `/stats` to the backend, so no CORS config is needed in development.

---

## Pages

| Route | Description |
|---|---|
| `/` | All todos — list, filter, sort, create, delete |
| `/todo?id=<uuid>` | Single todo detail view — full info, subtasks, edit |

---

## Docs

- [Features & Functionality](docs/features.md)
- [API Reference](docs/api.md)

## Features

### 📋 Todo List
- Live stats dashboard — Total, Active, Done, Overdue, and High Priority counts
- Create todos with title, description, priority, due date, tags, and subtasks
- Color-coded priority indicator on every row (red = High, amber = Medium, green = Low)
- Due date badges that flag **Overdue** (red) and **Today/Tomorrow** (amber) automatically
- Subtask progress shown inline (e.g. `2/5`)
- Filter by status (All/Active/Completed), priority, and free-text search — combinable
- Sort by Newest, Priority, or Due Date
- Delete with confirmation, hover-to-reveal on the list

### 📝 Todo Detail
- Full view with priority badge, status badge, description, tags, and metadata (created/updated timestamps, UUID)
- Toggle the whole todo or individual subtasks, with a live progress bar
- Edit in-place via a pre-filled form
- Clear error state for invalid or missing `?id=`

### 🎨 Design
- Clean, light UI with a warm paper background and ink-blue accent
- Color-coded priority "tabs" on each task card
- Responsive at all viewport widths

---

## Screenshots

> Add your screenshots to `docs/screenshots/` and they'll render below.

### Todo List
![Todo List](docs/screenshots/todo-list.png)

### Todo Detail
![Todo Detail](docs/screenshots/todo-detail.png)

### Create / Edit Form
![Create Todo Form](docs/screenshots/todo-form.png)

---
