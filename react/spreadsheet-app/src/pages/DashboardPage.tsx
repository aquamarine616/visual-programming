import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchDocs,
  createDocThunk,
  deleteDocThunk,
  duplicateDocThunk,
  renameDocThunk,
} from '../store/documentsSlice'
import { openCreateModal, closeCreateModal } from '../store/uiSlice'
import { Doc } from '../types'
import { cellKey } from '../utils/cellRef'
import { getValue } from '../utils/formulas'
import CreateDocModal from '../components/CreateDocModal'

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const docs = useAppSelector(s => s.documents.list)
  const loading = useAppSelector(s => s.documents.loading)
  const error = useAppSelector(s => s.documents.error)
  const showCreateModal = useAppSelector(s => s.ui.showCreateModal)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    dispatch(fetchDocs())
  }, [dispatch])

  async function handleCreate(name: string, rows: number, cols: number) {
    const res = await dispatch(createDocThunk({ name, rows, cols }))
    dispatch(closeCreateModal())
    if (createDocThunk.fulfilled.match(res)) {
      navigate('/documents/' + res.payload.id)
    }
  }

  function handleDelete(id: string) {
    if (!confirm('Удалить документ?')) return
    dispatch(deleteDocThunk(id))
  }

  function handleDuplicate(id: string) {
    dispatch(duplicateDocThunk(id))
  }

  function handleOpen(id: string) {
    navigate('/documents/' + id)
  }

  function startRename(d: Doc) {
    setEditingId(d.id)
    setEditingName(d.name)
  }

  function finishRename() {
    if (editingId) {
      dispatch(renameDocThunk({ id: editingId, name: editingName }))
      setEditingId(null)
    }
  }

  function formatDate(t: number): string {
    return new Date(t).toLocaleString()
  }

  return (
    <div className="dashboard">
      <div className="topbar">
        <h2>Мои документы</h2>
        <button onClick={() => dispatch(openCreateModal())}>+ Новый</button>
      </div>

      {loading && <p>Загрузка…</p>}
      {error && <p className="form-error">Ошибка: {error}</p>}
      {!loading && docs.length === 0 && <p>Нет документов</p>}

      <div className="doc-list">
        {docs.map(d => (
          <div key={d.id} className="doc-card">
            <div className="doc-name">
              {editingId === d.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={e => { if (e.key === 'Enter') finishRename() }}
                />
              ) : (
                <span onClick={() => handleOpen(d.id)}>{d.name}</span>
              )}
            </div>
            <div className="doc-meta">
              <div>Создан: {formatDate(d.createdAt)}</div>
              <div>Изменён: {formatDate(d.updatedAt)}</div>
            </div>
            <Preview doc={d} />
            <div className="doc-actions">
              <button onClick={() => handleOpen(d.id)}>Открыть</button>
              <button onClick={() => startRename(d)}>Переименовать</button>
              <button onClick={() => handleDuplicate(d.id)}>Дублировать</button>
              <button onClick={() => handleDelete(d.id)}>Удалить</button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <CreateDocModal
          onClose={() => dispatch(closeCreateModal())}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

function Preview({ doc }: { doc: Doc }) {
  const rows: string[][] = []
  for (let r = 0; r < 3; r++) {
    const row: string[] = []
    for (let c = 0; c < 3; c++) {
      row.push(getValue(doc.cells, cellKey(r, c)))
    }
    rows.push(row)
  }
  return (
    <table className="preview">
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((v, c) => (
              <td key={c}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
