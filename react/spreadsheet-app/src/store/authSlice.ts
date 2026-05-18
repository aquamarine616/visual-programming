import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, Tokens } from '../types'
import * as auth from '../auth'

export type AuthState = {
  user: User | null
  accessToken: string | null
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  initialized: false,
}

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (args: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await auth.register(args.name, args.email, args.password)
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  }
)

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (args: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await auth.login(args.email, args.password)
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    await auth.logout()
  }
)

export const refreshThunk = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      return await auth.refresh()
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  }
)

export const updateNameThunk = createAsyncThunk(
  'auth/updateName',
  async (name: string, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }
    if (!state.auth.user) return rejectWithValue('Не авторизован')
    try {
      return await auth.updateName(state.auth.user.id, name)
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  }
)

export const updatePasswordThunk = createAsyncThunk(
  'auth/updatePassword',
  async (args: { oldPassword: string; newPassword: string }, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }
    if (!state.auth.user) return rejectWithValue('Не авторизован')
    try {
      await auth.updatePassword(state.auth.user.id, args.oldPassword, args.newPassword)
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  }
)

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(state, action: PayloadAction<Tokens>) {
      state.accessToken = action.payload.accessToken
    },
    clearAuth(state) {
      state.user = null
      state.accessToken = null
    },
    setInitialized(state) {
      state.initialized = true
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.accessToken = action.payload.tokens.accessToken
    })
    builder.addCase(registerThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload.user
      state.accessToken = action.payload.tokens.accessToken
    })
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null
      state.accessToken = null
    })

    builder.addCase(refreshThunk.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.tokens.accessToken
      state.initialized = true
    })
    builder.addCase(refreshThunk.rejected, (state) => {
      state.user = null
      state.accessToken = null
      state.initialized = true
    })

    builder.addCase(updateNameThunk.fulfilled, (state, action) => {
      state.user = action.payload
    })
  },
})

export const { setTokens, clearAuth, setInitialized, clearError } = slice.actions
export default slice.reducer
