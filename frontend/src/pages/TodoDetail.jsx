import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getTodo, updateTodo, toggleTodo, toggleSubtask, deleteTodo } from '../api/todos.js'
import TodoForm from '../components/TodoForm.jsx'
import styles from './TodoDetail.module.css'

const PRIORITY_COLORS = { high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' }

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatDue(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diff = d - now
  const days = Math.ceil(diff / 86400000)
  const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (diff < 0) return { label: `${label} · Overdue`, status: 'overdue' }
  if (days === 0) return { label: `${label} · Due today`, status: 'warn' }
  if (days === 1) return { label: `${label} · Tomorrow`, status: 'warn' }
  return { label, status: 'normal' }
}

export default function TodoDetail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = params.get('id')
  const [todo, setTodo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) { setError('No todo ID provided'); setLoading(false); return }
    getTodo(id)
      .then(setTodo)
      .catch(() => setError('Todo not found'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleToggle() {
    const updated = await toggleTodo(todo.id)
    setTodo(updated)
  }

  async function handleSubtask(sid) {
    const updated = await toggleSubtask(todo.id, sid)
    setTodo(updated)
  }

  async function handleUpdate(data) {
    const updated = await updateTodo(todo.id, data)
    setTodo(updated)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this todo permanently?')) return
    await deleteTodo(todo.id)
    navigate('/')
  }

  if (loading) return <div className={styles.center}>Loading...</div>
  if (error) return (
    <div className={styles.center}>
      <p className={styles.errorMsg}>{error}</p>
      <button className={styles.backBtn} onClick={() => navigate('/')}>← Back to list</button>
    </div>
  )

  const due = formatDue(todo.dueDate)
  const subDone = todo.subtasks?.filter(s => s.completed).length ?? 0
  const subTotal = todo.subtasks?.length ?? 0
  const progress = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : null

  if (editing) {
    return (
      <div>
        <button className={styles.backBtn} onClick={() => setEditing(false)}>← Cancel</button>
        <TodoForm initialData={todo} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← All Todos</button>
        <div className={styles.headerActions}>
          <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit</button>
          <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Title row */}
        <div className={styles.titleRow}>
          <button
            className={`${styles.check} ${todo.completed ? styles.checked : ''}`}
            onClick={handleToggle}
          >
            {todo.completed ? '✓' : ''}
          </button>
          <h1 className={`${styles.title} ${todo.completed ? styles.done : ''}`}>{todo.title}</h1>
        </div>

        {/* Badges */}
        <div className={styles.badges}>
          <span
            className={styles.priorityBadge}
            style={{ color: PRIORITY_COLORS[todo.priority], borderColor: PRIORITY_COLORS[todo.priority] }}
          >
            {todo.priority.toUpperCase()} PRIORITY
          </span>
          <span className={`${styles.statusBadge} ${todo.completed ? styles.completedBadge : styles.activeBadge}`}>
            {todo.completed ? '✓ COMPLETED' : '● ACTIVE'}
          </span>
        </div>

        {/* Description */}
        {todo.description && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Description</h3>
            <p className={styles.description}>{todo.description}</p>
          </div>
        )}

        {/* Due date */}
        {due && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Due Date</h3>
            <p className={`${styles.dueDate} ${styles[due.status]}`}>📅 {due.label}</p>
          </div>
        )}

        {/* Tags */}
        {todo.tags?.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionLabel}>Tags</h3>
            <div className={styles.tags}>
              {todo.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Subtasks */}
        {subTotal > 0 && (
          <div className={styles.section}>
            <div className={styles.subtaskHeader}>
              <h3 className={styles.sectionLabel}>Subtasks</h3>
              <span className={styles.subtaskCount}>{subDone}/{subTotal} done</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <ul className={styles.subtaskList}>
              {todo.subtasks.map(sub => (
                <li
                  key={sub.id}
                  className={`${styles.subtask} ${sub.completed ? styles.subDone : ''}`}
                  onClick={() => handleSubtask(sub.id)}
                >
                  <span className={`${styles.subCheck} ${sub.completed ? styles.subChecked : ''}`}>
                    {sub.completed ? '✓' : ''}
                  </span>
                  {sub.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata */}
        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created</span>
            <span className={styles.metaValue}>{formatDateTime(todo.createdAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Last Updated</span>
            <span className={styles.metaValue}>{formatDateTime(todo.updatedAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>ID</span>
            <span className={`${styles.metaValue} mono`} style={{ fontSize: '0.75rem' }}>{todo.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
