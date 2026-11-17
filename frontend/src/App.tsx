import { useEffect, useState } from 'react'
import { api } from './api.ts'
import OrdersPage from './pages/OrdersPage.tsx'
import ProductsPage from './pages/ProductsPage.tsx'

type Page = 'products' | 'orders'
type BackendStatus = 'checking' | 'online' | 'offline'

export default function App() {
  const [page, setPage] = useState<Page>('products')
  const [backend, setBackend] = useState<BackendStatus>('checking')

  // Ask the backend whether it is running (GET /api/health).
  useEffect(() => {
    api
      .checkHealth()
      .then(() => setBackend('online'))
      .catch(() => setBackend('offline'))
  }, [])

  return (
    <div className="app">
      <header className="header">
        <span className="logo">CBL Shop</span>

        <nav className="tabs">
          <button
            className={page === 'products' ? 'tab active' : 'tab'}
            onClick={() => setPage('products')}
          >
            Products
          </button>
          <button
            className={page === 'orders' ? 'tab active' : 'tab'}
            onClick={() => setPage('orders')}
          >
            Orders
          </button>
        </nav>

        <span className={`status ${backend}`}>
          {backend === 'checking' && 'Checking backend…'}
          {backend === 'online' && 'Backend connected'}
          {backend === 'offline' && 'Backend not connected'}
        </span>
      </header>

      <main className="main">{page === 'products' ? <ProductsPage /> : <OrdersPage />}</main>
    </div>
  )
}
