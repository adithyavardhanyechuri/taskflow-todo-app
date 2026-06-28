import axios from 'axios'

const api = axios.create({ baseURL: '' })

export const getTodos = (params) => api.get('/todos', { params }).then(r => r.data)
export const getTodo = (id) => api.get(`/todos/${id}`).then(r => r.data)
export const createTodo = (data) => api.post('/todos', data).then(r => r.data)
export const updateTodo = (id, data) => api.put(`/todos/${id}`, data).then(r => r.data)
export const toggleTodo = (id) => api.patch(`/todos/${id}/toggle`).then(r => r.data)
export const toggleSubtask = (id, sid) => api.patch(`/todos/${id}/subtasks/${sid}/toggle`).then(r => r.data)
export const deleteTodo = (id) => api.delete(`/todos/${id}`).then(r => r.data)
export const getStats = () => api.get('/stats').then(r => r.data)
