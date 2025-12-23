import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";

export const fetchMeThunk = createAsyncThunk("auth/me", async () => {
  try {
    const res = await authApi.me();
    if (res.status === "SUCCESS") return res.data.user;
    return null;
  } catch (err) {
    return null;
  }
});

export const loginThunk = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  const res = await authApi.login(payload);
  if (res.status !== "SUCCESS") return thunkAPI.rejectWithValue(res.message);

  try {
    const me = await authApi.me();
    return me.status === "SUCCESS" ? me.data.user : null;
  } catch {
    return null;
  }
});

export const registerThunk = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  const res = await authApi.register(payload);
  if (res.status !== "SUCCESS") return thunkAPI.rejectWithValue(res.message);

  try {
    const me = await authApi.me();
    return me.status === "SUCCESS" ? me.data.user : null;
  } catch {
    return null;
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
  return true;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
    error: null,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchMeThunk.pending, (s) => {
      s.loading = true;
    });
    b.addCase(fetchMeThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.user = a.payload;
    });
    b.addCase(fetchMeThunk.rejected, (s) => {
      s.loading = false;
      s.user = null;
    });

    b.addCase(loginThunk.fulfilled, (s, a) => {
      s.user = a.payload;
      s.error = null;
    });
    b.addCase(loginThunk.rejected, (s, a) => {
      s.error = a.payload || "Login failed";
    });

    b.addCase(registerThunk.fulfilled, (s, a) => {
      s.user = a.payload;
      s.error = null;
    });
    b.addCase(registerThunk.rejected, (s, a) => {
      s.error = a.payload || "Registration failed";
    });

    b.addCase(logoutThunk.fulfilled, (s) => {
      s.user = null;
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
