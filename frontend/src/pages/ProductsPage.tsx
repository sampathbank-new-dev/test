import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api.ts'
import { formatPrice } from '../format.ts'
import type { Product } from '../types.ts'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')

  async function loadProducts() {
    try {
      setProducts(await api.getProducts())
      setError('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  // Load the product list once, when the page opens.
  useEffect(() => {
    loadProducts()
  }, [])

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    try {
      await api.createProduct({ name, price: Number(price), stock: Number(stock) })
      setName('')
      setPrice('')
      setStock('')
      await loadProducts()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"?`)) return
    try {
      await api.deleteProduct(product.id)
      await loadProducts()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section>
      <h1>Products</h1>

      <form className="card form" onSubmit={handleAdd}>
        <input
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          min="0"
          step="1"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
        <button type="submit">Add product</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="card">
        {products.length === 0 ? (
          <p className="empty">No products yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th className="right">Price</th>
                <th className="right">Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td className="right">{formatPrice(product.price)}</td>
                  <td className="right">{product.stock}</td>
                  <td className="right">
                    <button className="danger" onClick={() => handleDelete(product)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
