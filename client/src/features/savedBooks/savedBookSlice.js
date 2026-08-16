import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../apiError.js";
import {
  fetchSavedBooksRequest,
  fetchSaveStatusRequest,
  saveBookRequest,
  unsaveBookRequest,
} from "./savedBookAPI.js";

const initialState = {
  savedBooks: [],
  savedBookIds: {},
  status: "idle",
  error: null,
  statusByBookId: {},
  actionStatusByBookId: {},
};

const setSaved = (state, bookId, saved) => {
  if (!bookId) return;
  if (saved) {
    state.savedBookIds[bookId] = true;
  } else {
    delete state.savedBookIds[bookId];
  }
};

export const fetchSavedBooks = createAsyncThunk(
  "savedBooks/fetchSavedBooks",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await fetchSavedBooksRequest();
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchSaveStatus = createAsyncThunk(
  "savedBooks/fetchSaveStatus",
  async (bookId, { rejectWithValue }) => {
    try {
      const { data } = await fetchSaveStatusRequest(bookId);
      return { bookId, saved: Boolean(data.data?.saved) };
    } catch (error) {
      return rejectWithValue({ bookId, message: getApiErrorMessage(error) });
    }
  },
);

export const saveBook = createAsyncThunk(
  "savedBooks/saveBook",
  async (bookId, { rejectWithValue }) => {
    try {
      await saveBookRequest(bookId);
      return { bookId };
    } catch (error) {
      return rejectWithValue({ bookId, message: getApiErrorMessage(error) });
    }
  },
);

export const unsaveBook = createAsyncThunk(
  "savedBooks/unsaveBook",
  async (bookId, { rejectWithValue }) => {
    try {
      await unsaveBookRequest(bookId);
      return { bookId };
    } catch (error) {
      return rejectWithValue({ bookId, message: getApiErrorMessage(error) });
    }
  },
);

const savedBookSlice = createSlice({
  name: "savedBooks",
  initialState,
  reducers: {
    clearSavedBookError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedBooks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSavedBooks.fulfilled, (state, action) => {
        const books = action.payload.data?.books || [];
        state.status = "succeeded";
        state.savedBooks = books;
        state.savedBookIds = books.reduce((ids, book) => {
          ids[book.id] = true;
          return ids;
        }, {});
      })
      .addCase(fetchSavedBooks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSaveStatus.pending, (state, action) => {
        state.statusByBookId[action.meta.arg] = "loading";
      })
      .addCase(fetchSaveStatus.fulfilled, (state, action) => {
        state.statusByBookId[action.payload.bookId] = "succeeded";
        setSaved(state, action.payload.bookId, action.payload.saved);
      })
      .addCase(fetchSaveStatus.rejected, (state, action) => {
        const bookId = action.payload?.bookId || action.meta.arg;
        state.statusByBookId[bookId] = "failed";
        state.error = action.payload?.message || "Unable to load save status";
      })
      .addCase(saveBook.pending, (state, action) => {
        state.actionStatusByBookId[action.meta.arg] = "saving";
        setSaved(state, action.meta.arg, true);
      })
      .addCase(saveBook.fulfilled, (state, action) => {
        state.actionStatusByBookId[action.payload.bookId] = "idle";
        setSaved(state, action.payload.bookId, true);
      })
      .addCase(saveBook.rejected, (state, action) => {
        const bookId = action.payload?.bookId || action.meta.arg;
        state.actionStatusByBookId[bookId] = "idle";
        setSaved(state, bookId, false);
        state.error = action.payload?.message || "Unable to save book";
      })
      .addCase(unsaveBook.pending, (state, action) => {
        state.actionStatusByBookId[action.meta.arg] = "removing";
        setSaved(state, action.meta.arg, false);
      })
      .addCase(unsaveBook.fulfilled, (state, action) => {
        state.actionStatusByBookId[action.payload.bookId] = "idle";
        setSaved(state, action.payload.bookId, false);
        state.savedBooks = state.savedBooks.filter(
          (book) => book.id !== action.payload.bookId,
        );
      })
      .addCase(unsaveBook.rejected, (state, action) => {
        const bookId = action.payload?.bookId || action.meta.arg;
        state.actionStatusByBookId[bookId] = "idle";
        setSaved(state, bookId, true);
        state.error = action.payload?.message || "Unable to remove saved book";
      });
  },
});

export const { clearSavedBookError } = savedBookSlice.actions;
export default savedBookSlice.reducer;
