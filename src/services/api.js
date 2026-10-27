import axios from "axios";

// Determine base API URL
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE_URL = rawApiUrl.endsWith("/")
  ? rawApiUrl.slice(0, -1)
  : rawApiUrl;

export const TOKEN_STORAGE_KEY = "arun_admin_token";
export const USER_STORAGE_KEY = "arun_admin_user";

// Create Axios client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized access
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials from both storages
      clearAuthData();
    }
    return Promise.reject(error);
  }
);

// Auth helper functions
export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuthData(token, user, rememberMe = true) {
  if (rememberMe) {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  } else {
    if (token) sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (user) sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export function isAuthenticated() {
  const token = getAuthToken();
  return Boolean(token && token.trim().length > 0);
}

// Contact Form API
export async function submitContact(data) {
  const response = await apiClient.post("/contact", data);
  return response.data;
}

// Admin Auth APIs
export async function loginAdmin(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
}

export async function getAdminProfile() {
  const response = await apiClient.get("/auth/me");
  return response.data;
}

// Contact Messages Management APIs
export async function getMessages(params = {}) {
  const response = await apiClient.get("/contact", { params });
  return response.data;
}

export async function getMessageById(id) {
  const response = await apiClient.get(`/contact/${id}`);
  return response.data;
}

export async function toggleMessageRead(id) {
  const response = await apiClient.patch(`/contact/${id}/read`);
  return response.data;
}

export async function deleteMessage(id) {
  const response = await apiClient.delete(`/contact/${id}`);
  return response.data;
}

// Projects Management APIs
export async function getProjects() {
  const response = await apiClient.get("/projects");
  return response.data;
}

export async function getProjectById(id) {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
}

export async function createProject(data) {
  const response = await apiClient.post("/projects", data);
  return response.data;
}

export async function updateProject(id, data) {
  const response = await apiClient.put(`/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id) {
  const response = await apiClient.delete(`/projects/${id}`);
  return response.data;
}

// System Health API
export async function checkHealth() {
  const response = await apiClient.get("/health");
  return response.data;
}

export default apiClient;

