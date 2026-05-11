import type { Middleware } from '@reduxjs/toolkit'
import { SPREADSHEET_MUTATION_TYPES } from './spreadsheetSlice'
import { saveActiveDoc } from './documentsSlice'
import type { RootState } from './rootReducer'

const DEBOUNCE_MS = 500

export const autosaveMiddleware: Middleware = (storeApi) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (next) => (action: any) => {
    const result = next(action)
    if (SPREADSHEET_MUTATION_TYPES.includes(action.type)) {
      const state = storeApi.getState() as RootState
      if (state.documents.activeId) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          storeApi.dispatch(saveActiveDoc() as any)
          timer = null
        }, DEBOUNCE_MS)
      }
    }
    return result
  }
}