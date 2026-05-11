import { describe, it, expect } from 'vitest'
import { getValue } from '../utils/formulas'
import { exportToCSV, importFromCSV } from '../utils/csv'

describe('Тесты формул', () => {
  it('считает сумму', () => {
    let cells = { A1: '1', A2: '2', A3: '3', B1: '=SUM(A1:A3)' }
    let res = getValue(cells, 'B1')
    expect(res).toBe('6')
  })

  it('считает среднее', () => {
    let cells = { B1: '2', B2: '4', B3: '6', C1: '=AVERAGE(B1:B3)' }
    let res = getValue(cells, 'C1')
    expect(res).toBe('4')
  })

  it('считает плюс и умножение', () => {
    let cells: any = {}
    cells.A1 = '3'
    cells.B1 = '4'
    cells.C1 = '=A1+B1'
    cells.D1 = '=A1*2'
    
    expect(getValue(cells, 'C1')).toBe('7')
    expect(getValue(cells, 'D1')).toBe('6')
  })
})

describe('Тесты csv', () => {
  it('сохраняет и загружает', () => {
    let cells = { A1: 'имя', B1: 'возраст', A2: 'Иван', B2: '30' }
    let csvText = exportToCSV(cells, 2, 2)
    let result = importFromCSV(csvText)
    
    expect(result.cells.A1).toBe('имя')
    expect(result.cells.B2).toBe('30')
  })
})