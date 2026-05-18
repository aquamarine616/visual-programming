import type { Middleware, AnyAction } from '@reduxjs/toolkit'
import { SPREADSHEET_MUTATION_TYPES, markSaved } from './spreadsheetSlice'
import { saveActiveDoc } from './documentsSlice'
import type { RootState } from './rootReducer'
import type { AppDispatch } from './index'

const DEBOUNCE_MS = 500

export const autosaveMiddleware: Middleware = (storeApi) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (next) => (action: unknown) => {
    const result = next(action)
    const a = action as AnyAction
    if ((SPREADSHEET_MUTATION_TYPES as string[]).includes(a.type)) {
      const state = storeApi.getState() as RootState
      if (state.documents.activeId && state.auth.accessToken) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          ;(storeApi.dispatch as AppDispatch)(saveActiveDoc())
            .unwrap()
            .then(() => (storeApi.dispatch as AppDispatch)(markSaved()))
            .catch(() => {  })
          timer = null
        }, DEBOUNCE_MS)
      }
    }
    return result
  }
}
