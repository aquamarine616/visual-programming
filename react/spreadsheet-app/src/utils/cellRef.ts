export function colToLetter(col: number): string {
  let s = ''
  let n = col
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

export function letterToCol(s: string): number {
  let n = 0
  for (let i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 64)
  }
  return n - 1
}

export function cellKey(row: number, col: number): string {
  return colToLetter(col) + (row + 1)
}

export function parseRef(ref: string): { row: number; col: number } | null {
  const m = ref.match(/^([A-Z]+)(\d+)$/)
  if (!m) return null
  const col = letterToCol(m[1])
  const row = parseInt(m[2], 10) - 1
  return { row, col }
}