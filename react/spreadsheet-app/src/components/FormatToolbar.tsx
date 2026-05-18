import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCellFormat } from '../store/spreadsheetSlice'
import { cellKey } from '../utils/cellRef'
import { CellFormat } from '../types'

export default function FormatToolbar() {
  const dispatch = useAppDispatch()
  const s = useAppSelector(st => st.spreadsheet)

  function getRange(): Array<{ row: number; col: number }> {
    const r1 = Math.min(s.selRow, s.selEndRow)
    const r2 = Math.max(s.selRow, s.selEndRow)
    const c1 = Math.min(s.selCol, s.selEndCol)
    const c2 = Math.max(s.selCol, s.selEndCol)
    const arr: Array<{ row: number; col: number }> = []
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) arr.push({ row: r, col: c })
    }
    return arr
  }

  function apply(patch: Partial<CellFormat>) {
    for (const { row, col } of getRange()) {
      dispatch(setCellFormat({ row, col, patch }))
    }
  }

  function toggle(field: 'bold' | 'italic' | 'underline') {
    const cur = s.cellFormats[cellKey(s.selRow, s.selCol)]
    apply({ [field]: !cur?.[field] })
  }

  const current = s.cellFormats[cellKey(s.selRow, s.selCol)] || {}

  return (
    <div className="format-toolbar">
      <button
        className={current.bold ? 'fmt-active' : ''}
        onClick={() => toggle('bold')}
        title="Жирный (Ctrl+B)"
      >
        <b>Ж</b>
      </button>
      <button
        className={current.italic ? 'fmt-active' : ''}
        onClick={() => toggle('italic')}
        title="Курсив (Ctrl+I)"
      >
        <i>К</i>
      </button>
      <button
        className={current.underline ? 'fmt-active' : ''}
        onClick={() => toggle('underline')}
        title="Подчёркнутый (Ctrl+U)"
      >
        <u>П</u>
      </button>

      <span className="fmt-sep" />

      <label className="color-picker" title="Цвет фона">
        Фон
        <input
          type="color"
          value={current.bgColor || '#ffffff'}
          onChange={e => apply({ bgColor: e.target.value })}
        />
      </label>
      <label className="color-picker" title="Цвет текста">
        Текст
        <input
          type="color"
          value={current.textColor || '#000000'}
          onChange={e => apply({ textColor: e.target.value })}
        />
      </label>

      <span className="fmt-sep" />

      <button
        className={current.align === 'left' ? 'fmt-active' : ''}
        onClick={() => apply({ align: 'left' })}
        title="По левому краю"
      >
        ←
      </button>
      <button
        className={current.align === 'center' ? 'fmt-active' : ''}
        onClick={() => apply({ align: 'center' })}
        title="По центру"
      >
        ↔
      </button>
      <button
        className={current.align === 'right' ? 'fmt-active' : ''}
        onClick={() => apply({ align: 'right' })}
        title="По правому краю"
      >
        →
      </button>

      <span className="fmt-sep" />

      <select
        value={current.numberFormat || 'number'}
        onChange={e => apply({ numberFormat: e.target.value as CellFormat['numberFormat'] })}
        title="Формат числа"
      >
        <option value="number">Число</option>
        <option value="percent">Процент</option>
        <option value="currency">Валюта</option>
        <option value="date">Дата</option>
      </select>
    </div>
  )
}
