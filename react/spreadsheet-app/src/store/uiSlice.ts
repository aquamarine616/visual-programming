import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { saveActiveDoc } from './documentsSlice'

export type SaveStatus = 'saved' | 'saving' | 'error'

export type UiState = {
  showCreateModal: boolean
  saveStatus: SaveStatus
}

const initialState: UiState = {
  showCreateModal: false,
  saveStatus: 'saved',
}

const slice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCreateModal(state) {
      state.showCreateModal = true
    },
    closeCreateModal(state) {
      state.showCreateModal = false
    },
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.saveStatus = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveActiveDoc.pending, (state) => {
      state.saveStatus = 'saving'
    })
    builder.addCase(saveActiveDoc.fulfilled, (state) => {
      state.saveStatus = 'saved'
    })
    builder.addCase(saveActiveDoc.rejected, (state) => {
      state.saveStatus = 'error'
    })
  },
})

export const { openCreateModal, closeCreateModal, setSaveStatus } = slice.actions

export default slice.reducer