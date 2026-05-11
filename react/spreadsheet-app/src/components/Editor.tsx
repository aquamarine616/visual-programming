import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { saveActiveDoc, setActiveName, closeActiveDoc } from '../store/documentsSlice'
import { undo, redo, importCells } from '../store/spreadsheetSlice'
import { exportToCSV, exportToJSON, importFromCSV, downloadFile } from '../utils/csv'
import Sheet from './Sheet'
import FormulaBar from './FormulaBar'

export default function Editor() {
  let dispatch = useAppDispatch()
  let activeId = useAppSelector(s => s.documents.activeId)
  
  let docList = useAppSelector(s => s.documents.list)
  let docMeta = null
  for (let i = 0; i < docList.length; i++) {
    if (docList[i].id === activeId) {
      docMeta = docList[i]
    }
  }

  let saveStatus = useAppSelector(s => s.ui.saveStatus)
  let sheet = useAppSelector(s => s.spreadsheet)
  let fileInputRef = useRef<any>(null)

  useEffect(() => {
    function handler(e: any) {
      if (saveStatus !== 'saved') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [saveStatus])

  useEffect(() => {
    function handler(e: any) {
      let key = e.key.toLowerCase()
      if (e.ctrlKey || e.metaKey) {
        if (key === 's') {
          e.preventDefault()
          dispatch(saveActiveDoc() as any)
        }
        if (key === 'z') {
          e.preventDefault()
          dispatch(undo())
        }
        if (key === 'y') {
          e.preventDefault()
          dispatch(redo())
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [dispatch])

  if (!activeId || !docMeta) {
    return <div className="loading">Загрузка…</div>
  }

  function exportCSV() {
    let text = exportToCSV(sheet.cells, sheet.rows, sheet.cols)
    let name = 'doc'
    if (docMeta) name = docMeta.name
    downloadFile(name + '.csv', text, 'text/csv')
  }

  function exportJSON() {
    let text = exportToJSON(sheet.cells, sheet.rows, sheet.cols)
    let name = 'doc'
    if (docMeta) name = docMeta.name
    downloadFile(name + '.json', text, 'application/json')
  }

  function importCSV(e: any) {
    let file = e.target.files[0]
    if (!file) return
    let reader = new FileReader()
    reader.onload = () => {
      let res = importFromCSV(String(reader.result))
      dispatch(importCells({ cells: res.cells, rows: res.rows, cols: res.cols }))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  let statusText = 'Сохранено'
  if (saveStatus === 'saving') statusText = 'Сохранение…'
  if (saveStatus === 'error') statusText = 'Ошибка сохранения'

  return (
    <div className="editor">
      <div className="toolbar">
        <button onClick={() => dispatch(closeActiveDoc() as any)}>← Назад</button>
        <input
          className="doc-name-input"
          value={docMeta.name}
          onChange={e => dispatch(setActiveName(e.target.value))}
        />
        <span className={'save-status ' + saveStatus}>{statusText}</span>
        <button onClick={() => dispatch(saveActiveDoc() as any)}>Сохранить (Ctrl+S)</button>
        <button onClick={() => dispatch(undo())} disabled={sheet.undoStack.length === 0}>
          Undo (Ctrl+Z)
        </button>
        <button onClick={() => dispatch(redo())} disabled={sheet.redoStack.length === 0}>
          Redo (Ctrl+Y)
        </button>
        <button onClick={exportCSV}>Экспорт CSV</button>
        <button onClick={exportJSON}>Экспорт JSON</button>
        <button onClick={() => { if (fileInputRef.current) fileInputRef.current.click() }}>Импорт CSV</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={importCSV}
        />
      </div>

      <FormulaBar />
      <Sheet />
    </div>
  )
}