import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Doc } from '../types'
import * as api from '../api'
import { loadDoc, reset } from './spreadsheetSlice'
import type { RootState } from './rootReducer'

export type DocumentsState = {
  list: Doc[]
  activeId: string | null
  loading: boolean
}

const initialState: DocumentsState = {
  list: [],
  activeId: null,
  loading: false,
}

export const fetchDocs = createAsyncThunk(
  'documents/fetchDocs',
  async () => {
    return await api.getDocs()
  }
)

export const fetchDoc = createAsyncThunk(
  'documents/fetchDoc',
  async (id: string, { dispatch }) => {
    const doc = await api.getDoc(id)
    dispatch(loadDoc(doc))
    return doc
  }
)

export const createDocThunk = createAsyncThunk(
  'documents/create',
  async (args: { name: string; rows: number; cols: number }) => {
    return await api.createDoc(args.name, args.rows, args.cols)
  }
)

export const renameDocThunk = createAsyncThunk(
  'documents/rename',
  async (args: { id: string; name: string }) => {
    return await api.updateDoc(args.id, { name: args.name })
  }
)

export const deleteDocThunk = createAsyncThunk(
  'documents/delete',
  async (id: string) => {
    await api.deleteDoc(id)
    return id
  }
)

export const duplicateDocThunk = createAsyncThunk(
  'documents/duplicate',
  async (id: string) => {
    return await api.duplicateDoc(id)
  }
)

export const saveActiveDoc = createAsyncThunk<Doc | null, void, { state: RootState }>(
  'documents/saveActive',
  async (_, { getState }) => {
    const state = getState()
    const id = state.documents.activeId
    if (!id) return null
    const { cells, rows, cols, colWidths, rowHeights } = state.spreadsheet
    const doc = state.documents.list.find(d => d.id === id)
    const name = doc?.name || 'Документ'
    return await api.updateDoc(id, { cells, rows, cols, colWidths, rowHeights, name })
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
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDocs.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchDocs.fulfilled, (state, action) => {
      state.loading = false
      state.list = action.payload
    })
    builder.addCase(fetchDocs.rejected, (state) => {
      state.loading = false
    })

    builder.addCase(fetchDoc.fulfilled, (state, action) => {
      state.activeId = action.payload.id
      const idx = state.list.findIndex(d => d.id === action.payload.id)
      if (idx === -1) state.list.push(action.payload)
      else state.list[idx] = action.payload
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

export const { setActive, setActiveName } = slice.actions

export const closeActiveDoc = () => (dispatch: any) => {
  dispatch(setActive(null))
  dispatch(reset())
}

export default slice.reducer