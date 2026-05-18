import { User, Tokens } from './types'

const USERS_KEY = 'users'
const REFRESH_KEY = 'refreshToken'
const ACCESS_TTL_MS = 15 * 60 * 1000
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000

type StoredUser = {
  id: string
  name: string
  email: string
  password: string
  createdAt: number
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function loadUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function newId(): string {
  return 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

function makeToken(userId: string, ttl: number, type: 'access' | 'refresh'): string {
  const payload = { userId, exp: Date.now() + ttl, type }
  return btoa(JSON.stringify(payload))
}

export type TokenPayload = {
  userId: string
  exp: number
  type: 'access' | 'refresh'
}

export function parseToken(token: string): TokenPayload | null {
  try {
    return JSON.parse(atob(token))
  } catch {
    return null
  }
}

function publicUser(u: StoredUser): User {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }
}

export async function register(name: string, email: string, password: string): Promise<{ user: User; tokens: Tokens }> {
  await delay(150)
  const users = loadUsers()
  if (users.find(u => u.email === email)) {
    throw new Error('Пользователь с таким email уже существует')
  }
  const user: StoredUser = {
    id: newId(),
    name,
    email,
    password,
    createdAt: Date.now(),
  }
  users.push(user)
  saveUsers(users)
  const tokens: Tokens = {
    accessToken: makeToken(user.id, ACCESS_TTL_MS, 'access'),
    refreshToken: makeToken(user.id, REFRESH_TTL_MS, 'refresh'),
  }
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  return { user: publicUser(user), tokens }
}

export async function login(email: string, password: string): Promise<{ user: User; tokens: Tokens }> {
  await delay(150)
  const users = loadUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Неверный email или пароль')
  const tokens: Tokens = {
    accessToken: makeToken(user.id, ACCESS_TTL_MS, 'access'),
    refreshToken: makeToken(user.id, REFRESH_TTL_MS, 'refresh'),
  }
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  return { user: publicUser(user), tokens }
}

export async function logout(): Promise<void> {
  await delay(50)
  localStorage.removeItem(REFRESH_KEY)
}

export async function refresh(): Promise<{ user: User; tokens: Tokens }> {
  await delay(80)
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  if (!refreshToken) throw new Error('Refresh Token отсутствует')
  const payload = parseToken(refreshToken)
  if (!payload || payload.type !== 'refresh' || payload.exp < Date.now()) {
    localStorage.removeItem(REFRESH_KEY)
    throw new Error('Refresh Token истёк')
  }
  const users = loadUsers()
  const user = users.find(u => u.id === payload.userId)
  if (!user) {
    localStorage.removeItem(REFRESH_KEY)
    throw new Error('Пользователь не найден')
  }
  const tokens: Tokens = {
    accessToken: makeToken(user.id, ACCESS_TTL_MS, 'access'),
    refreshToken: makeToken(user.id, REFRESH_TTL_MS, 'refresh'),
  }
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  return { user: publicUser(user), tokens }
}

export async function updateName(userId: string, name: string): Promise<User> {
  await delay(100)
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) throw new Error('Пользователь не найден')
  users[idx].name = name
  saveUsers(users)
  return publicUser(users[idx])
}

export async function updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  await delay(100)
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) throw new Error('Пользователь не найден')
  if (users[idx].password !== oldPassword) throw new Error('Старый пароль неверный')
  users[idx].password = newPassword
  saveUsers(users)
}

export function verifyAccess(accessToken: string): string {
  const payload = parseToken(accessToken)
  if (!payload || payload.type !== 'access') {
    const err = new Error('Не авторизован') as Error & { status?: number }
    err.status = 401
    throw err
  }
  if (payload.exp < Date.now()) {
    const err = new Error('Токен истёк') as Error & { status?: number }
    err.status = 401
    throw err
  }
  return payload.userId
}
