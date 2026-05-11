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
} from '../store/spreadsheetSlice'
import { cellKey, colToLetter } from '../utils/cellRef'
import { getValue } from '../utils/formulas'
import ContextMenu from './ContextMenu'

export default function Sheet() {
  let dispatch = useAppDispatch()
  let state = useAppSelector(st => st.spreadsheet)
  let editorRef = useRef<HTMLInputElement>(null)
  
  let [scrollTop, setScrollTop] = useState(0)
  let [menu, setMenu] = useState<any>(null)

  useEffect(() => {
    if (state.editing) {
      if (editorRef.current) {
        editorRef.current.focus()
        editorRef.current.select()
      }
    }
  }, [state.editing])

  function getColW(c: number) {
    if (state.colWidths[c]) return state.colWidths[c]
    return 80
  }

  function getRowH(r: number) {
    if (state.rowHeights[r]) return state.rowHeights[r]
    return 24
  }

  let startRow = Math.floor(scrollTop / 24) - 5
  if (startRow < 0) startRow = 0
  
  let endRow = startRow + 60
  if (endRow > state.rows) endRow = state.rows
  
  let topPad = startRow * 24
  let bottomPad = (state.rows - endRow) * 24
  if (bottomPad < 0) bottomPad = 0

  function inSelection(r: number, c: number) {
    let r1 = state.selRow
    let r2 = state.selEndRow
    if (r1 > r2) { r1 = state.selEndRow; r2 = state.selRow }
    
    let c1 = state.selCol
    let c2 = state.selEndCol
    if (c1 > c2) { c1 = state.selEndCol; c2 = state.selCol }
    
    if (r >= r1 && r <= r2 && c >= c1 && c <= c2) return true
    return false
  }

  function commitEdit() {
    if (state.editing) {
      dispatch(setCell({ row: state.selRow, col: state.selCol, value: state.editValue }))
      dispatch(stopEditing())
    }
  }

  function handleSelect(row: number, col: number, shift: boolean) {
    commitEdit()
    dispatch(setSelection({ row: row, col: col, extend: shift }))
  }

  function handleStartEdit() {
    let val = state.cells[cellKey(state.selRow, state.selCol)]
    if (!val) val = ''
    dispatch(startEditing(val))
  }

  function startColResize(e: any, col: number) {
    e.preventDefault()
    e.stopPropagation()
    let startX = e.clientX
    let startW = getColW(col)
    
    function onMove(ev: any) {
      let diff = ev.clientX - startX
      let w = startW + diff
      if (w < 20) w = 20
      dispatch(setColWidth({ col: col, width: w }))
    }
    
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function startRowResize(e: any, row: number) {
    e.preventDefault()
    e.stopPropagation()
    let startY = e.clientY
    let startH = getRowH(row)
    
    function onMove(ev: any) {
      let diff = ev.clientY - startY
      let h = startH + diff
      if (h < 16) h = 16
      dispatch(setRowHeight({ row: row, height: h }))
    }
    
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function buildMenuItems() {
    let items = []
    if (menu) {
      if (menu.row !== undefined) {
        items.push({ label: 'Вставить строку выше', onClick: () => dispatch(insertRow(menu.row)) })
        items.push({ label: 'Вставить строку ниже', onClick: () => dispatch(insertRow(menu.row + 1)) })
        items.push({ label: 'Удалить строку', onClick: () => dispatch(deleteRow(menu.row)) })
      }
      if (menu.col !== undefined) {
        items.push({ label: 'Вставить столбец слева', onClick: () => dispatch(insertCol(menu.col)) })
        items.push({ label: 'Вставить столбец справа', onClick: () => dispatch(insertCol(menu.col + 1)) })
        items.push({ label: 'Удалить столбец', onClick: () => dispatch(deleteCol(menu.col)) })
      }
    }
    return items
  }

  let rowsToRender = []
  for (let r = startRow; r < endRow; r++) {
    rowsToRender.push(r)
  }

  let colsToRender = []
  for (let c = 0; c < state.cols; c++) {
    colsToRender.push(c)
  }

  return (
    <div className="sheet-container" onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <div className="sheet-grid">
        <div className="sheet-header-row">
          <div className="header-cell corner" style={{ width: 40, height: 24 }}></div>
          {colsToRender.map(c => (
            <div
              key={c}
              className="header-cell col-header"
              style={{ width: getColW(c), height: 24 }}
              onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, col: c }) }}
            >
              {colToLetter(c)}
              <div className="col-resizer" onMouseDown={e => startColResize(e, c)}></div>
            </div>
          ))}
        </div>

        <div style={{ height: topPad }}></div>

        {rowsToRender.map(r => (
          <div key={r} className="sheet-row" style={{ height: getRowH(r) }}>
            <div
              className="header-cell row-header"
              style={{ width: 40, height: getRowH(r) }}
              onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, row: r }) }}
            >
              {r + 1}
              <div className="row-resizer" onMouseDown={e => startRowResize(e, r)}></div>
            </div>
            {colsToRender.map(c => {
              let key = cellKey(r, c)
              let display = getValue(state.cells, key)
              
              let isActive = false
              if (r === state.selRow && c === state.selCol) isActive = true
              
              let isSel = inSelection(r, c)
              
              let classNameStr = 'cell'
              if (isSel) classNameStr += ' selected'
              if (isActive) classNameStr += ' active'

              return (
                <div
                  key={c}
                  className={classNameStr}
                  style={{ width: getColW(c), height: getRowH(r) }}
                  onMouseDown={e => handleSelect(r, c, e.shiftKey)}
                  onDoubleClick={handleStartEdit}
                  onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY, row: r, col: c }) }}
                >
                  {isActive && state.editing ? (
                    <input
                      ref={editorRef}
                      className="cell-editor"
                      value={state.editValue}
                      onChange={e => dispatch(setEditValue(e.target.value))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit()
                        if (e.key === 'Escape') dispatch(stopEditing())
                      }}
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

        <div style={{ height: bottomPad }}></div>
      </div>

      {menu ? (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={buildMenuItems()}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  )
}