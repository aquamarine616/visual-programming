import { describe, it, expect } from 'vitest'
import reducer, {
  openCreateModal,
  closeCreateModal,
  setSaveStatus,
} from '../store/uiSlice'

describe('Тесты uiSlice', () => {
  it('начальное состояние', () => {
    let state = reducer(undefined, { type: '@@INIT' })
    expect(state.showCreateModal).toBe(false)
    expect(state.saveStatus).toBe('saved')
  })

  it('открыть и закрыть', () => {
    let state1 = reducer(undefined, openCreateModal())
    expect(state1.showCreateModal).toBe(true)
    
    let state2 = reducer(state1, closeCreateModal())
    expect(state2.showCreateModal).toBe(false)
  })

  it('статус сохранения меняется', () => {
    let state = reducer(undefined, setSaveStatus('saving'))
    expect(state.saveStatus).toBe('saving')
  })
})