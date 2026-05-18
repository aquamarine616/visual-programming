import { useRef, useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setCell,
  setColWidth,
  setRowHeight,
  insertRow,
  deleteRow,
  insertCol,
  deleteCol,
  setSelection,
  startEditing,
  setEditValue,
  stopEditing,
  moveSelection,
} from '../store/spreadsheetSlice'
import { cellKey, colToLetter } from '../utils/cellRef'
import { getValue } from '../utils/formulas'
import { applyNumberFormat } from '../utils/numberFormat'
import { CellFormat } from '../types'
import ContextMenu from './ContextMenu'

const DEFAULT_COL_WIDTH = 80
const ROW_HEIGHT = 24
const HEADER_HEIGHT = 24
const INDEX_WIDTH = 40
const VISIBLE_ROWS = 60

type Props = {
  onCellSelect?: (row: number, col: number, shift: boolean) => void
}

export default function Sheet({ onCellSelect }: Props) {
  const dispatch = useAppDispatch()
  const s = useAppSelector(st => st.spreadsheet)
  const editorRef = useRef<HTMLInputElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [menu, setMenu] = useState<{ x: number; y: number; row?: number; col?: number } | null>(null)

  useEffect(() => {
    if (s.editing && editorRef.current) {
      editorRef.current.focus()

      const v = editorRef.current.value
      editorRef.current.setSelectionRange(v.length, v.length)
    }
  }, [s.editing])

  function getColW(c: number) { return s.colWidths[c] || DEFAULT_COL_WIDTH }
  function getRowH(r: number) { return s.rowHeights[r] || ROW_HEIGHT }

  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5)
  const endRow = Math.min(s.rows, startRow + VISIBLE_ROWS)
  const topPad = startRow * ROW_HEIGHT
  const bottomPad = Math.max(0, (s.rows - endRow) * ROW_HEIGHT)

  function inSelection(r: number, c: number) {
    const r1 = Math.min(s.selRow, s.selEndRow)
    const r2 = Math.max(s.selRow, s.selEndRow)
    const c1 = Math.min(s.selCol, s.selEndCol)
    const c2 = Math.max(s.selCol, s.selEndCol)
    return r >= r1 && r <= r2 && c >= c1 && c <= c2
  }

  function commitEdit() {
    if (s.editing) {
      dispatch(setCell({ row: s.selRow, col: s.selCol, value: s.editValue }))
      dispatch(stopEditing())
    }
  }

  function handleSelect(row: number, col: number, shift: boolean) {
    commitEdit()
    if (onCellSelect) onCellSelect(row, col, shift)
    else dispatch(setSelection({ row, col, extend: shift }))
  }

  function handleStartEdit() {
    dispatch(startEditing(s.cells[cellKey(s.selRow, s.selCol)] || ''))
  }

  function handleEditorKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()

      e.nativeEvent.stopImmediatePropagation()
    }
    if (e.key === 'Enter') {
      commitEdit()
      dispatch(moveSelection({ dRow: 1, dCol: 0 }))
    } else if (e.key === 'Escape') {
      dispatch(stopEditing())
    } else if (e.key === 'Tab') {
      commitEdit()
      dispatch(moveSelection({ dRow: 0, dCol: e.shiftKey ? -1 : 1 }))
    }
  }

  function startColResize(e: React.MouseEvent, col: number) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = getColW(col)
    function onMove(ev: MouseEvent) {
      const w = Math.max(20, startW + (ev.clientX - startX))
      dispatch(setColWidth({ col, width: w }))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function startRowResize(e: React.MouseEvent, row: number) {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    const startH = getRowH(row)
    function onMove(ev: MouseEvent) {
      const h = Math.max(16, startH + (ev.clientY - startY))
      dispatch(setRowHeight({ row, height: h }))
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function buildMenuItems() {
    if (!menu) return []
    const items: { label: string; onClick: () => void }[] = []
    if (menu.row !== undefined) {
      items.push({ label: 'Вставить строку выше', onClick: () => dispatch(insertRow(menu.row!)) })
      items.push({ label: 'Вставить строку ниже', onClick: () => dispatch(insertRow(menu.row! + 1)) })
      items.push({ label: 'Удалить строку', onClick: () => dispatch(deleteRow(menu.row!)) })
    }
    if (menu.col !== undefined) {
      items.push({ label: 'Вставить столбец слева', onClick: () => dispatch(insertCol(menu.col!)) })
      items.push({ label: 'Вставить столбец справа', onClick: () => dispatch(insertCol(menu.col! + 1)) })
      items.push({ label: 'Удалить столбец', onClick: () => dispatch(deleteCol(menu.col!)) })
    }
    return items
  }

  function formatStyle(f?: CellFormat): React.CSSProperties {
    if (!f) return {}
    const style: React.CSSProperties = {}
    if (f.bold) style.fontWeight = 'bold'
    if (f.italic) style.fontStyle = 'italic'
    if (f.underline) style.textDecoration = 'underline'
    if (f.bgColor) style.background = f.bgColor
    if (f.textColor) style.color = f.textColor
    if (f.align) style.justifyContent = f.align === 'left' ? 'flex-start' : f.align === 'right' ? 'flex-end' : 'center'
    return style
  }

  const rowsToRender: number[] = []
  for (let r = startRow; r < endRow; r++) rowsToRender.push(r)

  return (
    <div
      className="sheet-container"
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className="sheet-grid">
        <div className="sheet-header-row">
          <div className="header-cell corner" style={{ width: INDEX_WIDTH, height: HEADER_HEIGHT }} />
          {Array.from({ length: s.cols }, (_, c) => (
            <div
              key={c}
              className="header-cell col-header"
              style={{ width: getColW(c), height: HEADER_HEIGHT }}
              onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, col: c }) }}
            >
              {colToLetter(c)}
              <div className="col-resizer" onMouseDown={e => startColResize(e, c)} />
            </div>
          ))}
        </div>

        <div style={{ height: topPad }} />

        {rowsToRender.map(r => (
          <div key={r} className="sheet-row" style={{ height: getRowH(r) }}>
            <div
              className="header-cell row-header"
              style={{ width: INDEX_WIDTH, height: getRowH(r) }}
              onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, row: r }) }}
            >
              {r + 1}
              <div className="row-resizer" onMouseDown={e => startRowResize(e, r)} />
            </div>
            {Array.from({ length: s.cols }, (_, c) => {
              const key = cellKey(r, c)
              const fmt = s.cellFormats[key]
              const raw = getValue(s.cells, key)
              const display = applyNumberFormat(raw, fmt?.numberFormat)
              const isActive = r === s.selRow && c === s.selCol
              const isSel = inSelection(r, c)
              const style = {
                width: getColW(c),
                height: getRowH(r),
                ...formatStyle(fmt),
              }
              return (
                <div
                  key={c}
                  className={'cell' + (isSel ? ' selected' : '') + (isActive ? ' active' : '')}
                  style={style}
                  onMouseDown={e => handleSelect(r, c, e.shiftKey)}
                  onDoubleClick={handleStartEdit}
                  onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, row: r, col: c }) }}
                >
                  {isActive && s.editing ? (
                    <input
                      ref={editorRef}
                      className="cell-editor"
                      value={s.editValue}
                      onChange={e => dispatch(setEditValue(e.target.value))}
                      onKeyDown={handleEditorKey}
                      onBlur={commitEdit}
                    />
                  ) : (
                    <span>{display}</span>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        <div style={{ height: bottomPad }} />
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={buildMenuItems()}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  )
}
