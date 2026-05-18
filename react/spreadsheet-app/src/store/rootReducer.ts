import { combineReducers } from '@reduxjs/toolkit'
import spreadsheet from './spreadsheetSlice'
import documents from './documentsSlice'
import ui from './uiSlice'
import auth from './authSlice'

export const rootReducer = combineReducers({
  spreadsheet,
  documents,
  ui,
  auth,
})

export type RootState = ReturnType<typeof rootReducer>
