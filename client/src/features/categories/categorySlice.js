import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/axios.jsx";
import { getApiErrorMessage } from "../apiError.js";

const initialState = {
  items: [],
  selectedCategory: null,
  status: "idle",
  selectedStatus: "idle",
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/categories", { params });
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/categories/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchCategoryBySlug = createAsyncThunk(
  "categories/fetchCategoryBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/categories/slug/${slug}`);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/categories", payload);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/categories/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/categories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory(state) {
      state.selectedCategory = null;
      state.selectedStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data?.categories || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((category) => category.id !== action.payload);
        if (state.selectedCategory?.id === action.payload) {
          state.selectedCategory = null;
        }
      })
      .addMatcher(
        (action) =>
          [fetchCategoryById.pending.type, fetchCategoryBySlug.pending.type].includes(action.type),
        (state) => {
          state.selectedStatus = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          [fetchCategoryById.fulfilled.type, fetchCategoryBySlug.fulfilled.type].includes(
            action.type,
          ),
        (state, action) => {
          state.selectedStatus = "succeeded";
          state.selectedCategory = action.payload.data?.category || null;
        }
      )
      .addMatcher(
        (action) =>
          [fetchCategoryById.rejected.type, fetchCategoryBySlug.rejected.type].includes(action.type),
        (state, action) => {
          state.selectedStatus = "failed";
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => [createCategory.fulfilled.type, updateCategory.fulfilled.type].includes(action.type),
        (state, action) => {
          const category = action.payload.data?.category;
          if (!category) return;
          const existingIndex = state.items.findIndex((item) => item.id === category.id);
          if (existingIndex >= 0) {
            state.items[existingIndex] = category;
          } else {
            state.items.unshift(category);
          }
          state.selectedCategory = category;
        }
      );
  },
});

export const { clearSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
