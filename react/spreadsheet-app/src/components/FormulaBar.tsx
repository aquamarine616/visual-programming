import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCell, setEditValue, stopEditing } from '../store/spreadsheetSlice'
import { cellKey } from '../utils/cellRef'

export default function FormulaBar() {
  let dispatch = useAppDispatch()
  
  let row = useAppSelector(s => s.spreadsheet.selRow)
  let col = useAppSelector(s => s.spreadsheet.selCol)
  
  let editing = useAppSelector(s => s.spreadsheet.editing)
  let editValue = useAppSelector(s => s.spreadsheet.editValue)
  
  let cells = useAppSelector(s => s.spreadsheet.cells)
  let cellValue = cells[cellKey(row, col)]
  if (!cellValue) {
    cellValue = ''
  }

  let value = ''
  if (editing) {
    value = editValue
  } else {
    value = cellValue
  }

  function commit() {
    if (editing) {
      dispatch(setCell({ row: row, col: col, value: editValue }))
      dispatch(stopEditing())
    }
  }

  return (
    <div className="formula-bar">
      <div className="cell-ref">{cellKey(row, col)}</div>
      <input
        value={value}
        onChange={e => dispatch(setEditValue(e.target.value))}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            commit()
            e.target.blur()
          }
        }}
        onBlur={commit}
      />
    </div>
  )
}