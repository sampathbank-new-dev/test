import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api.ts'
import { formatDate, formatPrice } from '../format.ts'
import type { Order, Product } from '../types.ts'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  // Form fields
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')

  async function loadData() {
    try {
      // The order form needs the product list too (for the drop-down).
      const [orderList, productList] = await Promise.all([api.getOrders(), api.getProducts()])
      setOrders(orderList)
      setProducts(productList)
      setError('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Load orders and products once, when the page opens.
  useEffect(() => {
    loadData()
  }, [])

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault()
    try {
      await api.createOrder({ productId: Number(productId), quantity: Number(quantity) })
      setProductId('')
      setQuantity('1')
      await loadData()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section>
      <h1>Orders</h1>

      <form className="card form" onSubmit={handlePlaceOrder}>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          <option value="">Choose a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id} disabled={product.stock === 0}>
              {product.name} – {formatPrice(product.price)} ({product.stock} in stock)
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <button type="submit">Place order</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="card">
        {orders.length === 0 ? (
          <p className="empty">No orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th className="right">Quantity</th>
                <th className="right">Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.productName}</td>
                  <td className="right">{order.quantity}</td>
                  <td className="right">{formatPrice(order.totalPrice)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
