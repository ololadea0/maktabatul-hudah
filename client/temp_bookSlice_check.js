import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/axios.jsx";
import { getApiErrorMessage } from "../apiError.js";

const initialState = {
  items: [],
  selectedBook: null,
  pagination: null,
  status: "idle",
  selectedStatus: "idle",
  downloadStatus: "idle",
  error: null,
};

export const fetchBooks = createAsyncThunk("books/fetchBooks", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/books", { params });
    return data;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/books/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchBookBySlug = createAsyncThunk(
  "books/fetchBookBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/books/slug/${slug}`);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const downloadBook = createAsyncThunk(
  "books/downloadBook",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/books/${id}/download`);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createBook = createAsyncThunk(
  "books/createBook",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/books", payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateBook = createAsyncThunk(
  "books/updateBook",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/books/${id}`, payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteBook = createAsyncThunk("books/deleteBook", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/books/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearSelectedBook(state) {
      state.selectedBook = null;
      state.selectedStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data?.books || [];
        state.pagination = action.payload.data?.pagination || null;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(downloadBook.pending, (state) => {
        state.downloadStatus = "loading";
      })
      .addCase(downloadBook.fulfilled, (state, action) => {
        state.downloadStatus = "succeeded";
        state.selectedBook = action.payload.data?.book || state.selectedBook;
      })
      .addCase(downloadBook.rejected, (state, action) => {
        state.downloadStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.items = state.items.filter((book) => book.id !== action.payload);
        if (state.selectedBook?.id === action.payload) {
          state.selectedBook = null;
        }
      })
      .addMatcher(
        (action) => [fetchBookById.pending.type, fetchBookBySlug.pending.type].includes(action.type),
        (state) => {
          state.selectedStatus = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [fetchBookById.fulfilled.type, fetchBookBySlug.fulfilled.type].includes(action.type),
        (state, action) => {
          state.selectedStatus = "succeeded";
          state.selectedBook = action.payload.data?.book || null;
        }
      )
      .addMatcher(
        (action) => [fetchBookById.rejected.type, fetchBookBySlug.rejected.type].includes(action.type),
        (state, action) => {
          state.selectedStatus = "failed";
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => [createBook.fulfilled.type, updateBook.fulfilled.type].includes(action.type),
        (state, action) => {
          const book = action.payload.data?.book;
          if (!book) return;
          const existingIndex = state.items.findIndex((item) => item.id === book.id);
          if (existingIndex >= 0) {
            state.items[existingIndex] = book;
          } else {
            state.items.unshift(book);
          }
          state.selectedBook = book;
        }
      });
  },
});

export const { clearSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
