import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchDocs,
  fetchDoc,
  createDocThunk,
  deleteDocThunk,
  duplicateDocThunk,
  renameDocThunk,
} from '../store/documentsSlice'
import { openCreateModal, closeCreateModal } from '../store/uiSlice'
import { cellKey } from '../utils/cellRef'
import { getValue } from '../utils/formulas'
import CreateDocModal from './CreateDocModal'

export default function Dashboard() {
  let dispatch = useAppDispatch()
  let docs = useAppSelector(s => s.documents.list)
  let showCreateModal = useAppSelector(s => s.ui.showCreateModal)
  
  let [editingId, setEditingId] = useState<any>(null)
  let [editingName, setEditingName] = useState('')

  useEffect(() => {
    dispatch(fetchDocs() as any)
  }, [dispatch])

  function handleCreate(name: string, rows: number, cols: number) {
    dispatch(createDocThunk({ name, rows, cols }) as any)
    dispatch(closeCreateModal())
  }

  function handleDelete(id: string) {
    let ok = confirm('Удалить документ?')
    if (ok) {
      dispatch(deleteDocThunk(id) as any)
    }
  }

  function handleDuplicate(id: string) {
    dispatch(duplicateDocThunk(id) as any)
  }

  function handleOpen(id: string) {
    dispatch(fetchDoc(id) as any)
  }

  function startRename(d: any) {
    setEditingId(d.id)
    setEditingName(d.name)
  }

  function finishRename() {
    if (editingId !== null) {
      dispatch(renameDocThunk({ id: editingId, name: editingName }) as any)
      setEditingId(null)
    }
  }

  function formatDate(t: number) {
    let d = new Date(t)
    return d.toLocaleString()
  }

  return (
    <div className="dashboard">
      <div className="topbar">
        <h2>Документы</h2>
        <button onClick={() => dispatch(openCreateModal())}>+ Новый</button>
      </div>

      {docs.length === 0 ? <p>Нет документов</p> : null}

      <div className="doc-list">
        {docs.map((d: any) => {
          
          let previewRows = []
          for (let r = 0; r < 3; r++) {
            let rowCells = []
            for (let c = 0; c < 3; c++) {
              let val = getValue(d.cells, cellKey(r, c))
              rowCells.push(val)
            }
            previewRows.push(rowCells)
          }

          return (
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
              
              <table className="preview">
                <tbody>
                  {previewRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((val, cIdx) => (
                        <td key={cIdx}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="doc-actions">
                <button onClick={() => handleOpen(d.id)}>Открыть</button>
                <button onClick={() => startRename(d)}>Переименовать</button>
                <button onClick={() => handleDuplicate(d.id)}>Дублировать</button>
                <button onClick={() => handleDelete(d.id)}>Удалить</button>
              </div>
            </div>
          )
        })}
      </div>

      {showCreateModal ? (
        <CreateDocModal
          onClose={() => dispatch(closeCreateModal())}
          onCreate={handleCreate}
        />
      ) : null}
    </div>
  )
}