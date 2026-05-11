import { SPREADSHEET_MUTATION_TYPES } from './spreadsheetSlice'
import { saveActiveDoc } from './documentsSlice'

let timer: any = null

export const autosaveMiddleware = (storeApi: any) => (next: any) => (action: any) => {
  let result = next(action)
  
  let isMutation = false
  for (let i = 0; i < SPREADSHEET_MUTATION_TYPES.length; i++) {
    if (SPREADSHEET_MUTATION_TYPES[i] === action.type) {
      isMutation = true
    }
  }

  if (isMutation) {
    let state = storeApi.getState()
    if (state.documents.activeId) {
      if (timer !== null) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        storeApi.dispatch(saveActiveDoc())
        timer = null
      }, 500)
    }
  }
  
  return result
}