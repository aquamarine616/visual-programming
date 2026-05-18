import { describe, it, expect } from 'vitest'
import { applyNumberFormat } from '../utils/numberFormat'

describe('numberFormat', () => {
  it('number форматирует обычное число', () => {
    expect(applyNumberFormat('42', 'number')).toBe('42')
  })

  it('percent умножает на 100 и добавляет %', () => {
    expect(applyNumberFormat('0.25', 'percent')).toBe('25.00%')
  })

  it('currency добавляет валюту', () => {
    expect(applyNumberFormat('100', 'currency')).toBe('100.00 ₽')
  })

  it('не-число возвращает как есть', () => {
    expect(applyNumberFormat('abc', 'currency')).toBe('abc')
  })
})
