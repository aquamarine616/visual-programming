import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { saveActiveDoc, setActiveName, closeActiveDoc } from '../store/documentsSlice'
import { undo, redo, importCells } from '../store/spreadsheetSlice'
import { exportToCSV, exportToJSON, importFromCSV, downloadFile } from '../utils/csv'
import Sheet from './Sheet'
import FormulaBar from './FormulaBar'

export default function Editor() {
  const dispatch = useAppDispatch()
  const activeId = useAppSelector(s => s.documents.activeId)
  const docMeta = useAppSelector(s => s.documents.list.find(d => d.id === s.documents.activeId))
  const saveStatus = useAppSelector(s => s.ui.saveStatus)
  const sheet = useAppSelector(s => s.spreadsheet)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (saveStatus !== 'saved') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [saveStatus])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault()
        dispatch(saveActiveDoc())
      } else if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault()
        dispatch(undo())
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault()
        dispatch(redo())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  if (!activeId || !docMeta) return <div className="loading">Загрузка…</div>

  function exportCSV() {
    const text = exportToCSV(sheet.cells, sheet.rows, sheet.cols)
    downloadFile((docMeta?.name || 'doc') + '.csv', text, 'text/csv')
  }

  function exportJSON() {
    const text = exportToJSON(sheet.cells, sheet.rows, sheet.cols)
    downloadFile((docMeta?.name || 'doc') + '.json', text, 'application/json')
  }

  function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const { cells, rows, cols } = importFromCSV(String(reader.result))
      dispatch(importCells({ cells, rows, cols }))
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const statusText =
    saveStatus === 'saving' ? 'Сохранение…' :
    saveStatus === 'error' ? 'Ошибка сохранения' : 'Сохранено'

  return (
    <div className="editor">
      <div className="toolbar">
        <button onClick={() => dispatch(closeActiveDoc())}>← Назад</button>
        <input
          className="doc-name-input"
          value={docMeta.name}
          onChange={e => dispatch(setActiveName(e.target.value))}
        />
        <span className={'save-status ' + saveStatus}>{statusText}</span>
        <button onClick={() => dispatch(saveActiveDoc())}>Сохранить (Ctrl+S)</button>
        <button onClick={() => dispatch(undo())} disabled={sheet.undoStack.length === 0}>
          Undo (Ctrl+Z)
        </button>
        <button onClick={() => dispatch(redo())} disabled={sheet.redoStack.length === 0}>
          Redo (Ctrl+Y)
        </button>
        <button onClick={exportCSV}>Экспорт CSV</button>
        <button onClick={exportJSON}>Экспорт JSON</button>
        <button onClick={() => fileInputRef.current?.click()}>Импорт CSV</button>
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