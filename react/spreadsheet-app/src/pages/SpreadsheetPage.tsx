import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useBlocker } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchDoc,
  saveActiveDoc,
  setActiveName,
  renameDocThunk,
} from '../store/documentsSlice'
import {
  undo,
  redo,
  importCells,
  setCell,
  setCellFormat,
  selectAll,
  moveSelection,
  startEditing,
  stopEditing,
  setEditValue,
  clearCells,
  setClipboard,
  pasteClipboard,
  setSelection,
} from '../store/spreadsheetSlice'
import { exportToCSV, exportToJSON, importFromCSV, downloadFile } from '../utils/csv'
import { cellKey } from '../utils/cellRef'
import Sheet from '../components/Sheet'
import FormulaBar from '../components/FormulaBar'
import FormatToolbar from '../components/FormatToolbar'
import Breadcrumbs from '../routes/Breadcrumbs'
import { CellFormat } from '../types'

export default function SpreadsheetPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const activeId = useAppSelector(s => s.documents.activeId)
  const docMeta = useAppSelector(s => s.documents.list.find(d => d.id === documentId))
  const saveStatus = useAppSelector(s => s.ui.saveStatus)
  const sheet = useAppSelector(s => s.spreadsheet)
  const error = useAppSelector(s => s.documents.error)
  const loading = useAppSelector(s => s.documents.loading)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loadError, setLoadError] = useState<{ status: number; message: string } | null>(null)

  useEffect(() => {
    if (!documentId) return
    setLoadError(null)
    dispatch(fetchDoc(documentId)).then(res => {
      if (fetchDoc.rejected.match(res) && res.payload) {
        if (res.payload.status === 403) {
          navigate('/dashboard', { replace: true })
          return
        }
        setLoadError(res.payload)
      }
    })
  }, [documentId, dispatch, navigate])

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (sheet.dirty || saveStatus !== 'saved') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [sheet.dirty, saveStatus])

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    (sheet.dirty || saveStatus === 'saving') && currentLocation.pathname !== nextLocation.pathname
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const yes = confirm('У вас есть несохранённые изменения. Покинуть страницу?')
      if (yes) blocker.proceed()
      else blocker.reset()
    }
  }, [blocker])

  useEffect(() => {
    function getSelectedRange(): Array<{ row: number; col: number }> {
      const r1 = Math.min(sheet.selRow, sheet.selEndRow)
      const r2 = Math.max(sheet.selRow, sheet.selEndRow)
      const c1 = Math.min(sheet.selCol, sheet.selEndCol)
      const c2 = Math.max(sheet.selCol, sheet.selEndCol)
      const arr: Array<{ row: number; col: number }> = []
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) arr.push({ row: r, col: c })
      }
      return arr
    }

    function applyToggle(field: 'bold' | 'italic' | 'underline') {
      const sel = getSelectedRange()
      const currentKey = cellKey(sheet.selRow, sheet.selCol)
      const current = sheet.cellFormats[currentKey]
      const newVal = !current?.[field]
      for (const { row, col } of sel) {
        dispatch(setCellFormat({ row, col, patch: { [field]: newVal } }))
      }
    }

    function copySelection(cut: boolean) {
      const sel = getSelectedRange()
      const data = sel.map(({ row, col }) => ({
        row,
        col,
        value: sheet.cells[cellKey(row, col)] || '',
        format: sheet.cellFormats[cellKey(row, col)],
      }))
      dispatch(setClipboard(data))
      if (cut) dispatch(clearCells(sel))
    }

    function handler(e: KeyboardEvent) {

      if (sheet.editing) {
        if (e.key === 'Escape') {
          dispatch(stopEditing())
          e.preventDefault()
        }
        return
      }

      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && !t.classList.contains('cell-editor')) {
        return
      }

      const ctrl = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      if (ctrl && key === 's') {
        e.preventDefault()
        dispatch(saveActiveDoc())
        return
      }
      if (ctrl && key === 'z' && !e.shiftKey) {
        e.preventDefault()
        dispatch(undo())
        return
      }
      if ((ctrl && key === 'y') || (ctrl && e.shiftKey && key === 'z')) {
        e.preventDefault()
        dispatch(redo())
        return
      }
      if (ctrl && key === 'b') {
        e.preventDefault()
        applyToggle('bold')
        return
      }
      if (ctrl && key === 'i') {
        e.preventDefault()
        applyToggle('italic')
        return
      }
      if (ctrl && key === 'u') {
        e.preventDefault()
        applyToggle('underline')
        return
      }
      if (ctrl && key === 'a') {
        e.preventDefault()
        dispatch(selectAll())
        return
      }
      if (ctrl && key === 'c') {
        e.preventDefault()
        copySelection(false)
        return
      }
      if (ctrl && key === 'x') {
        e.preventDefault()
        copySelection(true)
        return
      }
      if (ctrl && key === 'v') {
        e.preventDefault()
        dispatch(pasteClipboard({ row: sheet.selRow, col: sheet.selCol }))
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        dispatch(clearCells(getSelectedRange()))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        dispatch(moveSelection({ dRow: -1, dCol: 0 }))
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        dispatch(moveSelection({ dRow: 1, dCol: 0 }))
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        dispatch(moveSelection({ dRow: 0, dCol: -1 }))
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        dispatch(moveSelection({ dRow: 0, dCol: 1 }))
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        dispatch(moveSelection({ dRow: 0, dCol: e.shiftKey ? -1 : 1 }))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const cur = sheet.cells[cellKey(sheet.selRow, sheet.selCol)] || ''
        dispatch(startEditing(cur))
        return
      }
      if (e.key === 'F2') {
        e.preventDefault()
        const cur = sheet.cells[cellKey(sheet.selRow, sheet.selCol)] || ''
        dispatch(startEditing(cur))
        return
      }

      if (!ctrl && !e.altKey && e.key.length === 1) {
        dispatch(startEditing(e.key))
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch, sheet])

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

  function commitName() {
    if (docMeta) dispatch(renameDocThunk({ id: docMeta.id, name: docMeta.name }))
  }

  if (loadError && loadError.status === 404) {
    return (
      <div className="loading">
        <p className="form-error">Документ не найден</p>
        <button onClick={() => navigate('/dashboard')}>Вернуться к списку</button>
      </div>
    )
  }
  if (loading && !docMeta) return <div className="loading">Загрузка…</div>
  if (!documentId || !docMeta || activeId !== documentId) return <div className="loading">Загрузка…</div>
  if (error && error !== 'Документ не найден') {
    return <div className="loading"><p className="form-error">{error}</p></div>
  }

  const statusText =
    saveStatus === 'saving' ? 'Сохранение…' :
    saveStatus === 'error' ? 'Ошибка сохранения' : 'Сохранено'

  function handleCellClick(row: number, col: number, shift: boolean) {
    dispatch(setSelection({ row, col, extend: shift }))
  }

  return (
    <div className="editor">
      <Breadcrumbs items={[
        { label: 'Мои документы', to: '/dashboard' },
        { label: docMeta.name },
      ]} />

      <div className="toolbar">
        <input
          className="doc-name-input"
          value={docMeta.name}
          onChange={e => dispatch(setActiveName(e.target.value))}
          onBlur={commitName}
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

      <FormatToolbar />
      <FormulaBar />
      <Sheet onCellSelect={handleCellClick} />
    </div>
  )
}
