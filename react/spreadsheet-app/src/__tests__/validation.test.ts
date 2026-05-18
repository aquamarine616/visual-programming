import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordMatch,
} from '../utils/validation'

describe('validation', () => {
  it('email пустой', () => {
    expect(validateEmail('')).not.toBeNull()
  })

  it('email неправильный', () => {
    expect(validateEmail('abc')).not.toBeNull()
  })

  it('email правильный', () => {
    expect(validateEmail('a@b.ru')).toBeNull()
  })

  it('пароль короткий', () => {
    expect(validatePassword('1234')).not.toBeNull()
  })

  it('пароль 8 символов', () => {
    expect(validatePassword('12345678')).toBeNull()
  })

  it('имя пустое', () => {
    expect(validateName('  ')).not.toBeNull()
  })

  it('пароли совпадают', () => {
    expect(validatePasswordMatch('12345678', '12345678')).toBeNull()
  })

  it('пароли не совпадают', () => {
    expect(validatePasswordMatch('12345678', 'other')).not.toBeNull()
  })
})
