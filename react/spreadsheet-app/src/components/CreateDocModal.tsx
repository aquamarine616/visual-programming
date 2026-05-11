import { useState } from 'react'

export default function CreateDocModal(props: any) {
  let [name, setName] = useState('Новый документ')
  let [rows, setRows] = useState(100)
  let [cols, setCols] = useState(26)

  function handleSubmit(e: any) {
    e.preventDefault()
    if (rows >= 1) {
      if (cols >= 1) {
        props.onCreate(name, rows, cols)
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={props.onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Новый документ</h3>
        <label>
          Название
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Строки
          <input
            type="number"
            min={1}
            max={1000}
            value={rows}
            onChange={e => setRows(parseInt(e.target.value))}
          />
        </label>
        <label>
          Столбцы
          <input
            type="number"
            min={1}
            max={26}
            value={cols}
            onChange={e => setCols(parseInt(e.target.value))}
          />
        </label>
        <div className="modal-buttons">
          <button type="button" onClick={props.onClose}>Отмена</button>
          <button type="submit">Создать</button>
        </div>
      </form>
    </div>
  )
}