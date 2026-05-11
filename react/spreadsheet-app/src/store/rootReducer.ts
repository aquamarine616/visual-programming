import { combineReducers } from '@reduxjs/toolkit'
import spreadsheet from './spreadsheetSlice'
import documents from './documentsSlice'
import ui from './uiSlice'

export const rootReducer = combineReducers({
  spreadsheet,
  documents,
  ui,
})

export type RootState = ReturnType<typeof rootReducer>