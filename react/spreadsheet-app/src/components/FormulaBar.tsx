import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCell, setEditValue, startEditing, stopEditing } from '../store/spreadsheetSlice'
import { cellKey } from '../utils/cellRef'

export default function FormulaBar() {
  const dispatch = useAppDispatch()
  const sel = useAppSelector(s => ({ row: s.spreadsheet.selRow, col: s.spreadsheet.selCol }))
  const editing = useAppSelector(s => s.spreadsheet.editing)
  const editValue = useAppSelector(s => s.spreadsheet.editValue)
  const cellValue = useAppSelector(s => s.spreadsheet.cells[cellKey(sel.row, sel.col)] || '')

  const value = editing ? editValue : cellValue

  function handleFocus() {
    if (!editing) dispatch(startEditing(cellValue))
  }

  function commit() {
    if (!editing) return
    dispatch(setCell({ row: sel.row, col: sel.col, value: editValue }))
    dispatch(stopEditing())
  }

  return (
    <div className="formula-bar">
      <div className="cell-ref">{cellKey(sel.row, sel.col)}</div>
      <input
        value={value}
        onFocus={handleFocus}
        onChange={e => dispatch(setEditValue(e.target.value))}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            commit()
            e.currentTarget.blur()
          }
        }}
        onBlur={commit}
      />
    </div>
  )
}
