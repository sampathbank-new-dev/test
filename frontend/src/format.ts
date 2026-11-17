// Change this to your currency code if needed.
const CURRENCY = 'LKR'

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY })

export function formatPrice(value: number): string {
  return money.format(value)
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString()
}
