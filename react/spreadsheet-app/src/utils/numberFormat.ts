import { CellFormat } from '../types'

export function applyNumberFormat(value: string, format?: CellFormat['numberFormat']): string {
  if (!format || format === 'number') {
    const n = Number(value)
    if (value === '' || isNaN(n)) return value
    return String(n)
  }
  if (format === 'percent') {
    const n = Number(value)
    if (isNaN(n)) return value
    return (n * 100).toFixed(2) + '%'
  }
  if (format === 'currency') {
    const n = Number(value)
    if (isNaN(n)) return value
    return n.toFixed(2) + ' ₽'
  }
  if (format === 'date') {
    const n = Number(value)
    if (!isNaN(n) && value !== '') {
      const d = new Date(n)
      return d.toLocaleDateString()
    }
    const d = new Date(value)
    if (isNaN(d.getTime())) return value
    return d.toLocaleDateString()
  }
  return value
}
