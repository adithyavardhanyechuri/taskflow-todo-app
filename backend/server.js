const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, "todos.json");

app.use(cors());
app.use(express.json());

// ── helpers ────────────────────────────────────────────────
function readTodos() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeTodos(todos) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// ── GET /todos  (with optional ?priority=&status=&tag=) ────
app.get("/todos", (req, res) => {
  let todos = readTodos();
  const { priority, status, tag, q } = req.query;

  if (priority) todos = todos.filter((t) => t.priority === priority);
  if (status === "completed") todos = todos.filter((t) => t.completed);
  if (status === "active") todos = todos.filter((t) => !t.completed);
  if (tag) todos = todos.filter((t) => t.tags?.includes(tag));
  if (q) {
    const lq = q.toLowerCase();
    todos = todos.filter(
      (t) =>
        t.title.toLowerCase().includes(lq) ||
        t.description?.toLowerCase().includes(lq)
    );
  }

  res.json(todos);
});

// ── GET /todos/:id ─────────────────────────────────────────
app.get("/todos/:id", (req, res) => {
  const todo = readTodos().find((t) => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
});

// ── POST /todos ────────────────────────────────────────────
app.post("/todos", (req, res) => {
  const { title, description, priority, dueDate, tags, subtasks } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });

  const todo = {
    id: uuidv4(),
    title: title.trim(),
    description: description?.trim() || "",
    priority: priority || "medium",
    dueDate: dueDate || null,
    tags: tags || [],
    subtasks: (subtasks || []).map((s) => ({
      id: uuidv4(),
      title: s.title || s,
      completed: false,
    })),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const todos = readTodos();
  todos.unshift(todo);
  writeTodos(todos);
  res.status(201).json(todo);
});

// ── PUT /todos/:id ─────────────────────────────────────────
app.put("/todos/:id", (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Todo not found" });

  todos[idx] = {
    ...todos[idx],
    ...req.body,
    id: todos[idx].id,
    createdAt: todos[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };

  writeTodos(todos);
  res.json(todos[idx]);
});

// ── PATCH /todos/:id/toggle ────────────────────────────────
app.patch("/todos/:id/toggle", (req, res) => {
  const todos = readTodos();
  const idx = todos.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Todo not found" });

  todos[idx].completed = !todos[idx].completed;
  todos[idx].updatedAt = new Date().toISOString();
  writeTodos(todos);
  res.json(todos[idx]);
});

// ── PATCH /todos/:id/subtasks/:sid/toggle ─────────────────
app.patch("/todos/:id/subtasks/:sid/toggle", (req, res) => {
  const todos = readTodos();
  const todo = todos.find((t) => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });

  const sub = todo.subtasks?.find((s) => s.id === req.params.sid);
  if (!sub) return res.status(404).json({ error: "Subtask not found" });

  sub.completed = !sub.completed;
  todo.updatedAt = new Date().toISOString();
  writeTodos(todos);
  res.json(todo);
});

// ── DELETE /todos/:id ──────────────────────────────────────
app.delete("/todos/:id", (req, res) => {
  const todos = readTodos();
  const filtered = todos.filter((t) => t.id !== req.params.id);
  if (filtered.length === todos.length)
    return res.status(404).json({ error: "Todo not found" });

  writeTodos(filtered);
  res.json({ success: true });
});

// ── GET /stats ─────────────────────────────────────────────
app.get("/stats", (req, res) => {
  const todos = readTodos();
  res.json({
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    high: todos.filter((t) => t.priority === "high").length,
    overdue: todos.filter(
      (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()
    ).length,
  });
});

app.listen(PORT, () =>
  console.log(`✅ Todo API running at http://localhost:${PORT}`)
);
