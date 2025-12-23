import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { employerApi } from "../api/employerApi";

export const fetchEmployerThunk = createAsyncThunk("employer/me", async () => {
  const res = await employerApi.me();
  if (res.status === "SUCCESS") return res.data;
  return null;
});

export const updateEmployerThunk = createAsyncThunk("employer/update", async (payload, thunkAPI) => {
  const res = await employerApi.updateProfile(payload);
  if (res.status !== "SUCCESS") return thunkAPI.rejectWithValue(res.message);
  return res;
});

const employerSlice = createSlice({
  name: "employer",
  initialState: {
    details: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchEmployerThunk.pending, (s) => {
      s.loading = true;
    });
    b.addCase(fetchEmployerThunk.fulfilled, (s, a) => {
      s.loading = false;
      s.details = a.payload;
    });
    b.addCase(fetchEmployerThunk.rejected, (s) => {
      s.loading = false;
      s.details = null;
    });

    b.addCase(updateEmployerThunk.fulfilled, (s) => {
      s.error = null;
    });
    b.addCase(updateEmployerThunk.rejected, (s, a) => {
      s.error = a.payload || "Update failed";
    });
  },
});

export default employerSlice.reducer;
