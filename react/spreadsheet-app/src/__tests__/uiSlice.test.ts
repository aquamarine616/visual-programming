import { describe, it, expect } from 'vitest'
import reducer, {
  openCreateModal,
  closeCreateModal,
  setSaveStatus,
} from '../store/uiSlice'

describe('uiSlice', () => {
  it('начальное состояние', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.showCreateModal).toBe(false)
    expect(state.saveStatus).toBe('saved')
  })

  it('открыть и закрыть модалку', () => {
    let state = reducer(undefined, openCreateModal())
    expect(state.showCreateModal).toBe(true)
    state = reducer(state, closeCreateModal())
    expect(state.showCreateModal).toBe(false)
  })

  it('смена статуса сохранения', () => {
    const state = reducer(undefined, setSaveStatus('saving'))
    expect(state.saveStatus).toBe('saving')
  })
})