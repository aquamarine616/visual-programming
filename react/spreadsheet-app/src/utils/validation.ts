export function validateEmail(email: string): string | null {
  if (!email) return 'Введите email'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Неверный формат email'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Введите пароль'
  if (password.length < 8) return 'Пароль должен быть не короче 8 символов'
  return null
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Введите имя'
  return null
}

export function validatePasswordMatch(a: string, b: string): string | null {
  if (a !== b) return 'Пароли не совпадают'
  return null
}
