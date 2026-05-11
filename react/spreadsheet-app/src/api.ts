import { Doc } from './types'

const DOCS_KEY = 'docs'

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

export async function getDocs(): Promise<Doc[]> {
  await delay(100)
  return loadAll()
}

export async function getDoc(id: string): Promise<Doc> {
  await delay(100)
  const docs = loadAll()
  const doc = docs.find(d => d.id === id)
  if (!doc) throw new Error('Документ не найден')
  return doc
}

export async function createDoc(name: string, rows: number, cols: number): Promise<Doc> {
  await delay(100)
  const docs = loadAll()
  const doc: Doc = {
    id: newId(),
    name,
    rows,
    cols,
    cells: {},
    colWidths: {},
    rowHeights: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  docs.push(doc)
  saveAll(docs)
  return doc
}

export async function updateDoc(id: string, patch: Partial<Doc>): Promise<Doc> {
  await delay(100)
  const docs = loadAll()
  const idx = docs.findIndex(d => d.id === id)
  if (idx === -1) throw new Error('Документ не найден')
  docs[idx] = { ...docs[idx], ...patch, updatedAt: Date.now() }
  saveAll(docs)
  return docs[idx]
}

export async function deleteDoc(id: string): Promise<void> {
  await delay(100)
  const docs = loadAll()
  const filtered = docs.filter(d => d.id !== id)
  saveAll(filtered)
}

export async function duplicateDoc(id: string): Promise<Doc> {
  await delay(100)
  const docs = loadAll()
  const orig = docs.find(d => d.id === id)
  if (!orig) throw new Error('Документ не найден')
  const copy: Doc = {
    ...orig,
    id: newId(),
    name: orig.name + ' (копия)',
    cells: { ...orig.cells },
    colWidths: { ...orig.colWidths },
    rowHeights: { ...orig.rowHeights },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  docs.push(copy)
  saveAll(docs)
  return copy
}