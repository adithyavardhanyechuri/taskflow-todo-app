# API Reference

Base URL: `http://localhost:3001`

All request and response bodies use JSON. All endpoints return `Content-Type: application/json`.

---

## Todos

### `GET /todos`

Returns an array of todos. Supports optional query-string filters.

**Query parameters**

| Param | Type | Description |
|---|---|---|
| `status` | `active` \| `completed` | Filter by completion state |
| `priority` | `low` \| `medium` \| `high` | Filter by priority |
| `tag` | string | Filter todos that include this tag |
| `q` | string | Full-text search across title and description |

**Response** `200 OK`
```json
[
  {
    "id": "3f2f...",
    "title": "Buy groceries",
    "description": "",
    "priority": "medium",
    "dueDate": "2025-06-01",
    "tags": ["errands"],
    "subtasks": [],
    "completed": false,
    "createdAt": "2025-05-28T10:00:00.000Z",
    "updatedAt": "2025-05-28T10:00:00.000Z"
  }
]
```

---

### `GET /todos/:id`

Returns a single todo by its UUID.

**Response** `200 OK` — todo object  
**Response** `404 Not Found` — `{ "error": "Todo not found" }`

---

### `POST /todos`

Creates a new todo.

**Request body**

```json
{
  "title": "string (required)",
  "description": "string",
  "priority": "low | medium | high",
  "dueDate": "YYYY-MM-DD | null",
  "tags": ["string"],
  "subtasks": [{ "title": "string" }]
}
```

**Response** `201 Created` — the created todo object  
**Response** `400 Bad Request` — `{ "error": "Title is required" }`

---

### `PUT /todos/:id`

Replaces all editable fields of a todo. Include only the fields you want to change; omitted fields retain their existing values.

**Request body** — same shape as `POST /todos`

**Response** `200 OK` — updated todo object  
**Response** `404 Not Found`

---

### `PATCH /todos/:id/toggle`

Flips the `completed` boolean on a todo.

**Response** `200 OK` — updated todo object  
**Response** `404 Not Found`

---

### `PATCH /todos/:id/subtasks/:subtaskId/toggle`

Flips the `completed` boolean on a single subtask.

**Response** `200 OK` — the parent todo object (with updated subtask)  
**Response** `404 Not Found` — if the todo or subtask ID is not found

---

### `DELETE /todos/:id`

Permanently deletes a todo.

**Response** `200 OK` — `{ "success": true }`  
**Response** `404 Not Found`

---

## Stats

### `GET /stats`

Returns aggregate counts over all todos.

**Response** `200 OK`
```json
{
  "total": 12,
  "completed": 4,
  "active": 8,
  "high": 3,
  "overdue": 2
}
```

`overdue` counts active todos whose `dueDate` is before the current timestamp.

---

## Error format

All error responses use the shape:

```json
{ "error": "Human-readable message" }
```
