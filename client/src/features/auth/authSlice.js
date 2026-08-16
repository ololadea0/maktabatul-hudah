import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { API_BASE_URL } from "../../services/axios.jsx";
import { getApiErrorMessage } from "../apiError.js";

const initialState = {
  user: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  status: "idle",
  error: null,
  message: null,
};

export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try
  {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (error)
  {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const login = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try
  {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  } catch (error)
  {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try
  {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (error)
  {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try
  {
    const { data } = await api.post("/auth/logout");
    return data;
  } catch (error)
  {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try
    {
      const { data } = await api.post("/auth/forgot-password", { email });
      return data;
    } catch (error)
    {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password, confirmPassword }, { rejectWithValue }) => {
    try
    {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      return data;
    } catch (error)
    {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const startGoogleLogin = createAsyncThunk("auth/startGoogleLogin", async () => {
  window.location.assign(`${API_BASE_URL}/api/auth/google`);
});

const setAuthenticatedUser = (state, action) => {
  state.user = action.payload.data?.user || null;
  state.isAuthenticated = Boolean(state.user);
  state.message = action.payload.message || null;
  state.error = null;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessage(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        setAuthenticatedUser(state, action);
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isCheckingAuth = false;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        setAuthenticatedUser(state, action);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        setAuthenticatedUser(state, action);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.message = action.payload.message || "Logout successful";
        state.error = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        setAuthenticatedUser(state, action);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearAuthMessage } = authSlice.actions;
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export default authSlice.reducer;
