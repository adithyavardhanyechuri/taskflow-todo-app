import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodos, getStats, createTodo, toggleTodo, deleteTodo } from '../api/todos.js'
import TodoForm from '../components/TodoForm.jsx'
import styles from './TodoList.module.css'

const PRIORITY_COLORS = { high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' }
const PRIORITY_LABELS = { high: '↑ High', medium: '→ Med', low: '↓ Low' }

function formatDate(d) {
  if (!d) return null
  const date = new Date(d)
  const now = new Date()
  const diff = date - now
  if (diff < 0) return { label: 'Overdue', overdue: true }
  const days = Math.ceil(diff / 86400000)
  if (days === 0) return { label: 'Today', warn: true }
  if (days === 1) return { label: 'Tomorrow', warn: true }
  return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
}

export default function TodoList() {
  const navigate = useNavigate()
  const [todos, setTodos] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({ status: 'all', priority: '', q: '' })
  const [sortBy, setSortBy] = useState('createdAt')

  const load = useCallback(async () => {
    const params = {}
    if (filters.status !== 'all') params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.q) params.q = filters.q
    const [data, st] = await Promise.all([getTodos(params), getStats()])
    setTodos(data)
    setStats(st)
    setLoading(false)
  }, [filters])

  useEffect(() => { load() }, [load])

  const sorted = [...todos].sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    }
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  async function handleToggle(e, id) {
    e.stopPropagation()
    await toggleTodo(id)
    load()
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!confirm('Delete this todo?')) return
    await deleteTodo(id)
    load()
  }

  async function handleCreate(data) {
    await createTodo(data)
    setShowForm(false)
    load()
  }

  return (
    <div className={styles.page}>
      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{stats.total ?? 0}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: 'var(--accent-light)' }}>{stats.active ?? 0}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: 'var(--success)' }}>{stats.completed ?? 0}</span>
          <span className={styles.statLabel}>Done</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: 'var(--high)' }}>{stats.overdue ?? 0}</span>
          <span className={styles.statLabel}>Overdue</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: 'var(--warn)' }}>{stats.high ?? 0}</span>
          <span className={styles.statLabel}>High Pri</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            placeholder="Search todos..."
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
          />
        </div>

        <div className={styles.controls}>
          <select className={styles.select} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <select className={styles.select} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">Any Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select className={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>

          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            + New Todo
          </button>
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()}>
            <TodoForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : sorted.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✦</div>
          <p>No todos here. Add one to get started.</p>
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>+ New Todo</button>
        </div>
      ) : (
        <ul className={styles.list}>
          {sorted.map(todo => {
            const due = formatDate(todo.dueDate)
            const subDone = todo.subtasks?.filter(s => s.completed).length ?? 0
            const subTotal = todo.subtasks?.length ?? 0
            return (
              <li
                key={todo.id}
                className={`${styles.item} ${todo.completed ? styles.done : ''}`}
                onClick={() => navigate(`/todo?id=${todo.id}`)}
              >
                <button
                  className={`${styles.check} ${todo.completed ? styles.checked : ''}`}
                  onClick={e => handleToggle(e, todo.id)}
                  aria-label="Toggle complete"
                >
                  {todo.completed && '✓'}
                </button>

                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <span className={styles.title}>{todo.title}</span>
                    <span
                      className={styles.priority}
                      style={{ color: PRIORITY_COLORS[todo.priority] }}
                    >
                      {PRIORITY_LABELS[todo.priority]}
                    </span>
                  </div>

                  {todo.description && (
                    <p className={styles.desc}>{todo.description}</p>
                  )}

                  <div className={styles.meta}>
                    {due && (
                      <span className={`${styles.due} ${due.overdue ? styles.overdue : ''} ${due.warn ? styles.warn : ''}`}>
                        📅 {due.label}
                      </span>
                    )}
                    {subTotal > 0 && (
                      <span className={styles.subtaskBadge}>
                        ☐ {subDone}/{subTotal}
                      </span>
                    )}
                    {todo.tags?.map(tag => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={e => handleDelete(e, todo.id)}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
