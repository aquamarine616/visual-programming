import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Doc, Tokens } from '../types'
import * as api from '../api'
import * as auth from '../auth'
import { loadDoc, reset } from './spreadsheetSlice'
import type { RootState } from './rootReducer'
import { setTokens, clearAuth } from './authSlice'

export type DocumentsState = {
  list: Doc[]
  activeId: string | null
  loading: boolean
  error: string | null
}

const initialState: DocumentsState = {
  list: [],
  activeId: null,
  loading: false,
  error: null,
}

async function withAuth<T>(
  getState: () => RootState,
  dispatch: (a: unknown) => unknown,
  call: (token: string) => Promise<T>,
): Promise<T> {
  const state = getState()
  let token = state.auth.accessToken
  if (!token) throw new api.ApiError(401, 'Не авторизован')
  try {
    return await call(token)
  } catch (e) {
    if (e instanceof api.ApiError && e.status === 401) {
      try {
        const res = await auth.refresh()
        const tokens: Tokens = res.tokens
        dispatch(setTokens(tokens))
        token = tokens.accessToken
        return await call(token)
      } catch {
        dispatch(clearAuth())
        throw new api.ApiError(401, 'Сессия истекла')
      }
    }
    throw e
  }
}

export const fetchDocs = createAsyncThunk<Doc[], void, { state: RootState }>(
  'documents/fetchDocs',
  async (_, { getState, dispatch }) => {
    return await withAuth(getState, dispatch, t => api.getDocs(t))
  }
)

export const fetchDoc = createAsyncThunk<Doc, string, { state: RootState; rejectValue: { status: number; message: string } }>(
  'documents/fetchDoc',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const doc = await withAuth(getState, dispatch, t => api.getDoc(t, id))
      dispatch(loadDoc(doc))
      return doc
    } catch (e) {
      if (e instanceof api.ApiError) {
        return rejectWithValue({ status: e.status, message: e.message })
      }
      throw e
    }
  }
)

export const createDocThunk = createAsyncThunk<Doc, { name: string; rows: number; cols: number }, { state: RootState }>(
  'documents/create',
  async (args, { getState, dispatch }) => {
    return await withAuth(getState, dispatch, t => api.createDoc(t, args.name, args.rows, args.cols))
  }
)

export const renameDocThunk = createAsyncThunk<Doc, { id: string; name: string }, { state: RootState }>(
  'documents/rename',
  async (args, { getState, dispatch }) => {
    return await withAuth(getState, dispatch, t => api.updateDoc(t, args.id, { name: args.name }))
  }
)

export const deleteDocThunk = createAsyncThunk<string, string, { state: RootState }>(
  'documents/delete',
  async (id, { getState, dispatch }) => {
    await withAuth(getState, dispatch, t => api.deleteDoc(t, id))
    return id
  }
)

export const duplicateDocThunk = createAsyncThunk<Doc, string, { state: RootState }>(
  'documents/duplicate',
  async (id, { getState, dispatch }) => {
    return await withAuth(getState, dispatch, t => api.duplicateDoc(t, id))
  }
)

export const saveActiveDoc = createAsyncThunk<Doc | null, void, { state: RootState }>(
  'documents/saveActive',
  async (_, { getState, dispatch }) => {
    const state = getState()
    const id = state.documents.activeId
    if (!id) return null
    const { cells, cellFormats, rows, cols, colWidths, rowHeights } = state.spreadsheet
    const doc = state.documents.list.find(d => d.id === id)
    const name = doc?.name || 'Документ'
    return await withAuth(getState, dispatch, t =>
      api.updateDoc(t, id, { cells, cellFormats, rows, cols, colWidths, rowHeights, name })
    )
  }
)

const slice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActive(state, action: PayloadAction<string | null>) {
      state.activeId = action.payload
    },
    setActiveName(state, action: PayloadAction<string>) {
      if (!state.activeId) return
      const doc = state.list.find(d => d.id === state.activeId)
      if (doc) doc.name = action.payload
    },
    clearDocs(state) {
      state.list = []
      state.activeId = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDocs.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchDocs.fulfilled, (state, action) => {
      state.loading = false
      state.list = action.payload
    })
    builder.addCase(fetchDocs.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message || 'Ошибка загрузки'
    })

    builder.addCase(fetchDoc.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchDoc.fulfilled, (state, action) => {
      state.loading = false
      state.activeId = action.payload.id
      const idx = state.list.findIndex(d => d.id === action.payload.id)
      if (idx === -1) state.list.push(action.payload)
      else state.list[idx] = action.payload
    })
    builder.addCase(fetchDoc.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload?.message || 'Ошибка загрузки'
    })

    builder.addCase(createDocThunk.fulfilled, (state, action) => {
      state.list.push(action.payload)
    })

    builder.addCase(renameDocThunk.fulfilled, (state, action) => {
      const idx = state.list.findIndex(d => d.id === action.payload.id)
      if (idx !== -1) state.list[idx] = action.payload
    })

    builder.addCase(deleteDocThunk.fulfilled, (state, action) => {
      state.list = state.list.filter(d => d.id !== action.payload)
      if (state.activeId === action.payload) state.activeId = null
    })

    builder.addCase(duplicateDocThunk.fulfilled, (state, action) => {
      state.list.push(action.payload)
    })

    builder.addCase(saveActiveDoc.fulfilled, (state, action) => {
      if (!action.payload) return
      const idx = state.list.findIndex(d => d.id === action.payload!.id)
      if (idx !== -1) state.list[idx] = action.payload
    })
  },
})

export const { setActive, setActiveName, clearDocs, clearError } = slice.actions

export const closeActiveDoc = () => (dispatch: (a: unknown) => unknown) => {
  dispatch(setActive(null))
  dispatch(reset())
}

export default slice.reducer
