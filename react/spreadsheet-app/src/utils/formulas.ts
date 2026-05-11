import { Cells } from '../types'
import { parseRef, cellKey } from './cellRef'

function getCellNum(cells: Cells, ref: string): number {
  let val = getValue(cells, ref)
  let num = parseFloat(val)
  if (isNaN(num)) return 0
  return num
}

export function getValue(cells: Cells, ref: string): string {
  let data = cells[ref]
  if (!data) return ''
  
  if (data[0] !== '=') {
    return data
  }

  let expression = data.slice(1).toUpperCase()

  if (expression.includes('SUM(') || expression.includes('AVERAGE(')) {
    let parts = expression.split('(')
    let funcName = parts[0]
    let range = parts[1].replace(')', '')
    let [start, end] = range.split(':')
    
    let a = parseRef(start)
    let b = parseRef(end)
    
    if (a && b) {
      let sum = 0
      let count = 0
      for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++) {
        for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) {
          sum += getCellNum(cells, cellKey(r, c))
          count++
        }
      }
      if (funcName === 'SUM') return sum.toString()
      if (funcName === 'AVERAGE') return (sum / count).toString()
    }
  }

  let coords = expression.match(/[A-Z]+\d+/g)
  if (coords) {
    for (let i = 0; i < coords.length; i++) {
      let c = coords[i]
      let v = getCellNum(cells, c)
      expression = expression.replace(c, v.toString())
    }
  }

  try {
    return eval(expression).toString()
  } catch (e) {
    return '#ОШИБКА!'
  }
}