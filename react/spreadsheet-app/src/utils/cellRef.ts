export function colToLetter(col: number): string {
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let s = ''
  let n = col
  while (n >= 0) {
    let mod = n % 26
    s = alphabet[mod] + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

export function letterToCol(s: string): number {
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let n = 0
  for (let i = 0; i < s.length; i++) {
    let char = s[i]
    let val = alphabet.indexOf(char) + 1
    n = n * 26 + val
  }
  return n - 1
}

export function cellKey(row: number, col: number): string {
  let letter = colToLetter(col)
  let r = row + 1
  return letter + r.toString()
}

export function parseRef(ref: string): any {
  let letters = ''
  let numbers = ''
  
  for (let i = 0; i < ref.length; i++) {
    let char = ref[i]
    if (isNaN(parseInt(char))) {
      letters += char
    } else {
      numbers += char
    }
  }
  
  if (letters === '' || numbers === '') {
    return null
  }
  
  let col = letterToCol(letters)
  let row = parseInt(numbers) - 1
  
  return { row: row, col: col }
}