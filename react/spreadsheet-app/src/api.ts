import { Doc } from './types'
import { verifyAccess } from './auth'

const DOCS_KEY = 'docs'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function loadAll(): Doc[] {
  const raw = localStorage.getItem(DOCS_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

function saveAll(docs: Doc[]) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
}

function newId(): string {
  return 'd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
}

function checkAuth(accessToken: string): string {
  try {
    return verifyAccess(accessToken)
  } catch (e) {
    throw new ApiError(401, (e as Error).message)
  }
}

export async function getDocs(accessToken: string): Promise<Doc[]> {
  await delay(100)
  const userId = checkAuth(accessToken)
  return loadAll().filter(d => d.userId === userId)
}

export async function getDoc(accessToken: string, id: string): Promise<Doc> {
  await delay(100)
  const userId = checkAuth(accessToken)
  const doc = loadAll().find(d => d.id === id)
  if (!doc) throw new ApiError(404, 'Документ не найден')
  if (doc.userId !== userId) throw new ApiError(403, 'Нет доступа к документу')
  return doc
}

export async function createDoc(
  accessToken: string,
  name: string,
  rows: number,
  cols: number,
): Promise<Doc> {
  await delay(100)
  const userId = checkAuth(accessToken)
  const docs = loadAll()
  const doc: Doc = {
    id: newId(),
    userId,
    name,
    rows,
    cols,
    cells: {},
    cellFormats: {},
    colWidths: {},
    rowHeights: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  docs.push(doc)
  saveAll(docs)
  return doc
}

export async function updateDoc(accessToken: string, id: string, patch: Partial<Doc>): Promise<Doc> {
  await delay(100)
  const userId = checkAuth(accessToken)
  const docs = loadAll()
  const idx = docs.findIndex(d => d.id === id)
  if (idx === -1) throw new ApiError(404, 'Документ не найден')
  if (docs[idx].userId !== userId) throw new ApiError(403, 'Нет доступа к документу')
  docs[idx] = { ...docs[idx], ...patch, userId: docs[idx].userId, updatedAt: Date.now() }
  saveAll(docs)
  return docs[idx]
}

export async function deleteDoc(accessToken: string, id: string): Promise<void> {
  await delay(100)
  const userId = checkAuth(accessToken)
  const docs = loadAll()
  const doc = docs.find(d => d.id === id)
  if (!doc) throw new ApiError(404, 'Документ не найден')
  if (doc.userId !== userId) throw new ApiError(403, 'Нет доступа к документу')
  saveAll(docs.filter(d => d.id !== id))
}

export async function duplicateDoc(accessToken: string, id: string): Promise<Doc> {
  await delay(100)
  const userId = checkAuth(accessToken)
  const docs = loadAll()
  const orig = docs.find(d => d.id === id)
  if (!orig) throw new ApiError(404, 'Документ не найден')
  if (orig.userId !== userId) throw new ApiError(403, 'Нет доступа к документу')
  const copy: Doc = {
    ...orig,
    id: newId(),
    name: orig.name + ' (копия)',
    cells: { ...orig.cells },
    cellFormats: { ...orig.cellFormats },
    colWidths: { ...orig.colWidths },
    rowHeights: { ...orig.rowHeights },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  docs.push(copy)
  saveAll(docs)
  return copy
}

export async function countDocs(accessToken: string): Promise<number> {
  await delay(50)
  const userId = checkAuth(accessToken)
  return loadAll().filter(d => d.userId === userId).length
}
