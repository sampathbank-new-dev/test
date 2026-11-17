import type { CreateOrderInput, CreateProductInput, Order, Product } from './types.ts'

// Every request goes to "/api" on the same server that serves this app:
//   - on your computer, Vite forwards /api to the backend (vite.config.ts)
//   - on the Ubuntu server, Nginx forwards /api to the backend (nginx/cbl-frontend.conf)
// When the backend is later split into microservices, only the Nginx routing changes.
// This file stays the same.
const API_URL = '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(API_URL + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error('Cannot reach the server. Check your connection.')
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  if (response.status === 204) {
    return undefined as T // "No Content", e.g. after a delete
  }
  return (await response.json()) as T
}

// NestJS sends errors as { statusCode, message, error }, and `message` can be a list.
async function readErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null)
  if (body?.message) {
    return Array.isArray(body.message) ? body.message.join(', ') : String(body.message)
  }
  if (response.status >= 500) {
    return 'The backend is not available. Is it running?'
  }
  return `Request failed with status ${response.status}`
}

export const api = {
  checkHealth: () => request<{ status: string }>('/health'),

  getProducts: () => request<Product[]>('/products'),
  createProduct: (input: CreateProductInput) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(input) }),
  deleteProduct: (id: number) => request<void>(`/products/${id}`, { method: 'DELETE' }),

  getOrders: () => request<Order[]>('/orders'),
  createOrder: (input: CreateOrderInput) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(input) }),
}
