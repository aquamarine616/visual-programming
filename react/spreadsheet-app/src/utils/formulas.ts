import { Cells } from '../types'
import { parseRef, cellKey } from './cellRef'

function getNumber(cells: Cells, ref: string, seen: Set<string>): number {
  const v = getValue(cells, ref, seen)
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function expandRange(from: string, to: string): string[] {
  const a = parseRef(from)
  const b = parseRef(to)
  if (!a || !b) return []
  const r1 = Math.min(a.row, b.row)
  const r2 = Math.max(a.row, b.row)
  const c1 = Math.min(a.col, b.col)
  const c2 = Math.max(a.col, b.col)
  const res: string[] = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      res.push(cellKey(r, c))
    }
  }
  return res
}

function evalExpr(cells: Cells, expr: string, seen: Set<string>): number | string {
  let s = expr.trim()

  const fn = s.match(/^([A-Z]+)\(([^)]*)\)$/)
  if (fn) {
    const name = fn[1]
    const args = fn[2]
    const range = args.match(/^([A-Z]+\d+):([A-Z]+\d+)$/)
    if (!range) return '#ERR'
    const refs = expandRange(range[1], range[2])
    for (const r of refs) {
      if (getValue(cells, r, seen) === '#CYCLE') return '#CYCLE'
    }
    if (name === 'SUM') {
      let sum = 0
      for (const r of refs) sum += getNumber(cells, r, seen)
      return sum
    }
    if (name === 'AVERAGE') {
      if (refs.length === 0) return 0
      let sum = 0
      for (const r of refs) sum += getNumber(cells, r, seen)
      return sum / refs.length
    }
    return '#ERR'
  }

  let cycle = false
  s = s.replace(/[A-Z]+\d+/g, (ref) => {
    const v = getValue(cells, ref, seen)
    if (v === '#CYCLE') cycle = true
    const n = Number(v)
    return String(isNaN(n) ? 0 : n)
  })
  if (cycle) return '#CYCLE'

  if (!/^[\d+\-*/.() ]+$/.test(s)) return '#ERR'

  try {
    const r = Function('return (' + s + ')')()
    if (typeof r === 'number' && !isNaN(r)) return r
    return '#ERR'
  } catch {
    return '#ERR'
  }
}

export function getValue(cells: Cells, ref: string, seen: Set<string> = new Set()): string {
  const raw = cells[ref]
  if (raw === undefined || raw === '') return ''
  if (!raw.startsWith('=')) return raw
  if (seen.has(ref)) return '#CYCLE'
  const next = new Set(seen)
  next.add(ref)
  return String(evalExpr(cells, raw.slice(1), next))
}
