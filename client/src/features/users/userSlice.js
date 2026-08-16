import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/axios.jsx";
import { getApiErrorMessage } from "../apiError.js";

const initialState = {
  dashboard: null,
  status: "idle",
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk(
  "users/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/dashboard");
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.dashboard = action.payload.data?.dashboard || null;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
