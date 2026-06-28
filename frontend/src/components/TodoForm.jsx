import { useState } from 'react'
import styles from './TodoForm.module.css'

export default function TodoForm({ initialData, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [priority, setPriority] = useState(initialData?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? initialData.dueDate.split('T')[0] : ''
  )
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState(initialData?.tags ?? [])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [subtasks, setSubtasks] = useState(
    initialData?.subtasks?.map(s => ({ ...s })) ?? []
  )
  const [error, setError] = useState('')

  function addTag(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const t = tagInput.trim().replace(',', '')
      if (t && !tags.includes(t)) setTags(prev => [...prev, t])
      setTagInput('')
    }
  }

  function removeTag(tag) { setTags(prev => prev.filter(t => t !== tag)) }

  function addSubtask(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const t = subtaskInput.trim()
      if (t) setSubtasks(prev => [...prev, { id: Date.now().toString(), title: t, completed: false }])
      setSubtaskInput('')
    }
  }

  function removeSubtask(id) { setSubtasks(prev => prev.filter(s => s.id !== id)) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    onSubmit({ title, description, priority, dueDate: dueDate || null, tags, subtasks })
  }

  return (
    <div className={styles.form}>
      <h2 className={styles.formTitle}>{initialData ? 'Edit Todo' : 'New Todo'}</h2>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.field}>
        <label className={styles.label}>Title *</label>
        <input
          className={styles.input}
          value={title}
          onChange={e => { setTitle(e.target.value); setError('') }}
          placeholder="What needs to be done?"
          autoFocus
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Priority</label>
          <div className={styles.priorityGroup}>
            {['low', 'medium', 'high'].map(p => (
              <button
                key={p}
                type="button"
                className={`${styles.priorityBtn} ${priority === p ? styles.priorityActive : ''} ${styles[p]}`}
                onClick={() => setPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Due Date</label>
          <input
            type="date"
            className={styles.input}
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Tags <span className={styles.hint}>(press Enter or comma)</span></label>
        <div className={styles.tagInput}>
          {tags.map(tag => (
            <span key={tag} className={styles.tagChip}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>✕</button>
            </span>
          ))}
          <input
            className={styles.tagField}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag..."
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Subtasks <span className={styles.hint}>(press Enter to add)</span></label>
        <ul className={styles.subtaskList}>
          {subtasks.map(sub => (
            <li key={sub.id} className={styles.subtaskItem}>
              <span>{sub.title}</span>
              <button type="button" className={styles.removeBtn} onClick={() => removeSubtask(sub.id)}>✕</button>
            </li>
          ))}
        </ul>
        <input
          className={styles.input}
          value={subtaskInput}
          onChange={e => setSubtaskInput(e.target.value)}
          onKeyDown={addSubtask}
          placeholder="Add a subtask..."
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn} onClick={handleSubmit}>
          {initialData ? 'Save Changes' : 'Create Todo'}
        </button>
      </div>
    </div>
  )
}
