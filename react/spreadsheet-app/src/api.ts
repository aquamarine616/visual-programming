const DOCS_KEY = 'docs'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function loadAll() {
  let raw = localStorage.getItem(DOCS_KEY)
  if (!raw) return []
  return JSON.parse(raw)
}

function saveAll(docs: any) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
}

function newId() {
  let time = Date.now().toString()
  let rand = Math.floor(Math.random() * 1000).toString()
  return 'd_' + time + '_' + rand
}

export async function getDocs() {
  await delay(100)
  return loadAll()
}

export async function getDoc(id: string) {
  await delay(100)
  let docs = loadAll()
  let found = null
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].id === id) {
      found = docs[i]
    }
  }
  if (!found) {
    throw new Error('Документ не найден')
  }
  return found
}

export async function createDoc(name: string, rows: number, cols: number) {
  await delay(100)
  let docs = loadAll()
  let doc = {
    id: newId(),
    name: name,
    rows: rows,
    cols: cols,
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

export async function updateDoc(id: string, patch: any) {
  await delay(100)
  let docs = loadAll()
  let updated = null
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].id === id) {
      docs[i] = { ...docs[i], ...patch, updatedAt: Date.now() }
      updated = docs[i]
    }
  }
  saveAll(docs)
  return updated
}

export async function deleteDoc(id: string) {
  await delay(100)
  let docs = loadAll()
  let newDocs = []
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].id !== id) {
      newDocs.push(docs[i])
    }
  }
  saveAll(newDocs)
}

export async function duplicateDoc(id: string) {
  await delay(100)
  let docs = loadAll()
  let orig = null
  for (let i = 0; i < docs.length; i++) {
    if (docs[i].id === id) {
      orig = docs[i]
    }
  }
  if (!orig) throw new Error('Документ не найден')
  
  let copy = {
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