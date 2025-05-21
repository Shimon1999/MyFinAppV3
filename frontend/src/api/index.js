import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create an axios instance
const client = axios.create({
  baseURL: API_URL,
});

// Attach token automatically if present
client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auth
export function register({ email, password, name }) {
  return client.post('/register', { email, password, name });
}
export function login({ email, password }) {
  return client.post('/login', new URLSearchParams({
    username: email,
    password,
  }));
}

// Accounts
export function listAccounts() {
  return client.get('/accounts');
}
export function createAccount(name) {
  return client.post('/accounts', { name });
}

// Transactions
export function uploadTransactions(file) {
  const data = new FormData();
  data.append('file', file);
  return client.post('/transactions/upload', data);
}
export function listTransactions() {
  return client.get('/transactions');
}
export function getTransaction(id) {
  return client.get(`/transactions/${id}`);
}
export function updateTransaction(id, category) {
  return client.put(`/transactions/${id}`, { category });
}
export function deleteTransaction(id) {
  return client.delete(`/transactions/${id}`);
}

// Categories & Overrides
export function listOverrides() {
  return client.get('/overrides');
}
export function createOverride(keyword, category) {
  return client.post('/overrides', { keyword, category });
}
export function updateOverride(id, category) {
  return client.put(`/overrides/${id}`, { category });
}
export function deleteOverride(id) {
  return client.delete(`/overrides/${id}`);
}
export function listCategories() {
  return client.get('/categories');
}
export function getCategoryTransactions(name) {
  return client.get(`/categories/${name}/transactions`);
}

// Goals
export function listGoals() {
  return client.get('/goals');
}
export function createGoal(name, target) {
  return client.post('/goals', { name, target });
}
export function addGoalFunds(id, amount) {
  return client.put(`/goals/${id}/funds`, { amount });
}
export function deleteGoal(id) {
  return client.delete(`/goals/${id}`);
}

// Budgets
export function listBudgets() {
  return client.get('/budgets');
}
export function createBudget(category, amount) {
  return client.post('/budgets', { category, amount });
}
export function updateBudget(id, amount) {
  return client.put(`/budgets/${id}`, { amount });
}
export function deleteBudget(id) {
  return client.delete(`/budgets/${id}`);
}

// Reports
export function getSummary(month) {
  return client.get('/reports/summary', { params: { month } });
}
export function getTrends(start, end) {
  return client.get('/reports/trends', { params: { start, end } });
}

export default client;