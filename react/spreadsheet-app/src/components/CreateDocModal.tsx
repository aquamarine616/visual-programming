import { useState } from 'react'

type Props = {
  onClose: () => void
  onCreate: (name: string, rows: number, cols: number) => void
}

export default function CreateDocModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('Новый документ')
  const [rows, setRows] = useState(100)
  const [cols, setCols] = useState(26)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rows < 1 || cols < 1) return
    onCreate(name, rows, cols)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
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
            onChange={e => setRows(Number(e.target.value))}
          />
        </label>
        <label>
          Столбцы
          <input
            type="number"
            min={1}
            max={26}
            value={cols}
            onChange={e => setCols(Number(e.target.value))}
          />
        </label>
        <div className="modal-buttons">
          <button type="button" onClick={onClose}>Отмена</button>
          <button type="submit">Создать</button>
        </div>
      </form>
    </div>
  )
}
