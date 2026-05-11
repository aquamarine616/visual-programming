import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { autosaveMiddleware } from './autosaveMiddleware'

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) => getDefault().concat(autosaveMiddleware),
})

export type { RootState } from './rootReducer'
export type AppDispatch = typeof store.dispatch