import { Cells } from '../types'
import { cellKey } from './cellRef'

export function exportToCSV(cells: Cells, rows: number, cols: number): string {
  const lines: string[] = []
  for (let r = 0; r < rows; r++) {
    const row: string[] = []
    for (let c = 0; c < cols; c++) {
      const v = cells[cellKey(r, c)] || ''
      if (v.includes(',') || v.includes('"') || v.includes('\n')) {
        row.push('"' + v.replace(/"/g, '""') + '"')
      } else {
        row.push(v)
      }
    }
    lines.push(row.join(','))
  }
  return lines.join('\n')
}

export function exportToJSON(cells: Cells, rows: number, cols: number): string {
  const arr: string[][] = []
  for (let r = 0; r < rows; r++) {
    const row: string[] = []
    for (let c = 0; c < cols; c++) {
      row.push(cells[cellKey(r, c)] || '')
    }
    arr.push(row)
  }
  return JSON.stringify(arr, null, 2)
}

function parseCSVLine(line: string): string[] {
  const res: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') {
        res.push(cur)
        cur = ''
      } else if (ch === '"') {
        inQuotes = true
      } else {
        cur += ch
      }
    }
  }
  res.push(cur)
  return res
}

export function importFromCSV(text: string): { cells: Cells; rows: number; cols: number } {
  const lines = text.split(/\r?\n/).filter(l => l.length > 0)
  if (lines.length === 0) return { cells: {}, rows: 0, cols: 0 }
  const data = lines.map(parseCSVLine)
  const cols = Math.max(...data.map(r => r.length))
  const rows = data.length
  const cells: Cells = {}
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const v = data[r][c]
      if (v !== '') cells[cellKey(r, c)] = v
    }
  }
  return { cells, rows, cols }
}

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}