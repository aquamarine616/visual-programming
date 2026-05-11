import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../api'
import { loadDoc, reset } from './spreadsheetSlice'

export const fetchDocs = createAsyncThunk('docs/fetch', async () => {
  let res = await api.getDocs()
  return res
})

export const fetchDoc = createAsyncThunk('docs/fetchOne', async (id: any, thunkAPI: any) => {
  let doc = await api.getDoc(id)
  thunkAPI.dispatch(loadDoc(doc))
  return doc
})

export const createDocThunk = createAsyncThunk('docs/create', async (args: any) => {
  let res = await api.createDoc(args.name, args.rows, args.cols)
  return res
})

export const renameDocThunk = createAsyncThunk('docs/rename', async (args: any) => {
  return await api.updateDoc(args.id, { name: args.name })
})

export const deleteDocThunk = createAsyncThunk('docs/delete', async (id: any) => {
  await api.deleteDoc(id)
  return id
})

export const duplicateDocThunk = createAsyncThunk('docs/duplicate', async (id: any) => {
  return await api.duplicateDoc(id)
})

export const saveActiveDoc = createAsyncThunk('docs/save', async (_, thunkAPI: any) => {
  let state = thunkAPI.getState()
  let id = state.documents.activeId
  if (!id) return null

  let doc = state.documents.list.find((d: any) => d.id === id)
  let name = 'Документ'
  if (doc) name = doc.name

  let dataToSave = {
    cells: state.spreadsheet.cells,
    rows: state.spreadsheet.rows,
    cols: state.spreadsheet.cols,
    colWidths: state.spreadsheet.colWidths,
    rowHeights: state.spreadsheet.rowHeights,
    name: name
  }

  let res = await api.updateDoc(id, dataToSave)
  return res
})

const slice = createSlice({
  name: 'documents',
  initialState: {
    list: [] as any[],
    activeId: null as any,
    loading: false,
  },
  reducers: {
    setActive(state, action) {
      state.activeId = action.payload
    },
    setActiveName(state, action) {
      if (state.activeId) {
        for (let i = 0; i < state.list.length; i++) {
          if (state.list[i].id === state.activeId) {
            state.list[i].name = action.payload
          }
        }
      }
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
      let found = false
      for (let i = 0; i < state.list.length; i++) {
        if (state.list[i].id === action.payload.id) {
          state.list[i] = action.payload
          found = true
        }
      }
      if (!found) {
        state.list.push(action.payload)
      }
    })
    
    builder.addCase(createDocThunk.fulfilled, (state, action) => {
      state.list.push(action.payload)
    })
    
    builder.addCase(renameDocThunk.fulfilled, (state, action) => {
      for (let i = 0; i < state.list.length; i++) {
        if (state.list[i].id === action.payload.id) {
          state.list[i] = action.payload
        }
      }
    })
    
    builder.addCase(deleteDocThunk.fulfilled, (state, action) => {
      let newList = []
      for (let i = 0; i < state.list.length; i++) {
        if (state.list[i].id !== action.payload) {
          newList.push(state.list[i])
        }
      }
      state.list = newList
      if (state.activeId === action.payload) {
        state.activeId = null
      }
    })
    
    builder.addCase(duplicateDocThunk.fulfilled, (state, action) => {
      state.list.push(action.payload)
    })
    
    builder.addCase(saveActiveDoc.fulfilled, (state, action) => {
      if (action.payload) {
        for (let i = 0; i < state.list.length; i++) {
          if (state.list[i].id === action.payload.id) {
            state.list[i] = action.payload
          }
        }
      }
    })
  },
})

export const { setActive, setActiveName } = slice.actions

export const closeActiveDoc = () => (dispatch: any) => {
  dispatch(setActive(null))
  dispatch(reset())
}

export default slice.reducer