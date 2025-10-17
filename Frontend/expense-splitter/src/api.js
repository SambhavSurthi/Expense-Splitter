import axios from 'axios'
import { API_BASE_URL } from './config.js'

const api = axios.create({ baseURL: API_BASE_URL })

// Participants
export const listParticipants = () => api.get('/participants').then(r => r.data)
export const createParticipant = (payload) => api.post('/participants', payload).then(r => r.data)
export const updateParticipant = (id, payload) => api.put(`/participants/${id}`, payload).then(r => r.data)
export const deleteParticipant = (id) => api.delete(`/participants/${id}`).then(r => r.data)

// Expenses
export const listExpenses = () => api.get('/expenses').then(r => r.data)
export const createExpense = (payload) => api.post('/expenses', payload).then(r => r.data)
export const updateExpense = (id, payload) => api.put(`/expenses/${id}`, payload).then(r => r.data)
export const deleteExpense = (id) => api.delete(`/expenses/${id}`).then(r => r.data)

// Summary
export const getSummary = () => api.get('/expenses/summary').then(r => r.data)


