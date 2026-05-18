import { describe, it, expect } from 'vitest'
import { getValue } from '../utils/formulas'
import { exportToCSV, importFromCSV } from '../utils/csv'

describe('формулы', () => {
  it('SUM', () => {
    const cells = { A1: '1', A2: '2', A3: '3', B1: '=SUM(A1:A3)' }
    expect(getValue(cells, 'B1')).toBe('6')
  })

  it('AVERAGE', () => {
    const cells = { B1: '2', B2: '4', B3: '6', C1: '=AVERAGE(B1:B3)' }
    expect(getValue(cells, 'C1')).toBe('4')
  })

  it('арифметика со ссылками', () => {
    const cells = { A1: '3', B1: '4', C1: '=A1+B1', D1: '=A1*2' }
    expect(getValue(cells, 'C1')).toBe('7')
    expect(getValue(cells, 'D1')).toBe('6')
  })

  it('обнаруживает прямой цикл', () => {
    const cells = { A1: '=A1' }
    expect(getValue(cells, 'A1')).toBe('#CYCLE')
  })

  it('обнаруживает косвенный цикл', () => {
    const cells = { A1: '=B1', B1: '=A1' }
    expect(getValue(cells, 'A1')).toBe('#CYCLE')
  })
})

describe('csv', () => {
  it('экспорт и импорт', () => {
    const cells = { A1: 'имя', B1: 'возраст', A2: 'Иван', B2: '30' }
    const csv = exportToCSV(cells, 2, 2)
    const parsed = importFromCSV(csv)
    expect(parsed.cells.A1).toBe('имя')
    expect(parsed.cells.B2).toBe('30')
  })
})
