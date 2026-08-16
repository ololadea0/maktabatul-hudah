import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../apiError.js";
import {
  fetchReaderInfoRequest,
  fetchReadingProgressRequest,
  saveReadingProgressRequest,
} from "./readerAPI.js";

const initialState = {
  totalPages: 0,
  currentPage: 1,
  zoom: 1,
  loading: false,
  rendering: false,
  error: null,
  pdfUrl: null,
  expiresAt: null,
  book: null,
  progressLoading: false,
  savingProgress: false,
  progress: 0,
  lastReadAt: null,
  watermark: null,
  rotation: 0,
  fitMode: "width",
  searchQuery: "",
  searchResults: [],
  searchLoading: false,
};

export const getReaderInfo = createAsyncThunk(
  "reader/getReaderInfo",
  async (bookId, { rejectWithValue }) => {
    try {
      const { data } = await fetchReaderInfoRequest(bookId);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const getReadingProgress = createAsyncThunk(
  "reader/getReadingProgress",
  async (bookId, { rejectWithValue }) => {
    try {
      const { data } = await fetchReadingProgressRequest(bookId);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const saveReadingProgress = createAsyncThunk(
  "reader/saveReadingProgress",
  async ({ bookId, currentPage, zoom }, { rejectWithValue }) => {
    try {
      const { data } = await saveReadingProgressRequest({
        bookId,
        currentPage,
        zoom,
      });
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const readerSlice = createSlice({
  name: "reader",
  initialState,
  reducers: {
    resetReader: () => initialState,
    setRendering(state, action) {
      state.rendering = action.payload;
    },
    setReaderError(state, action) {
      state.error = action.payload;
      state.loading = false;
      state.rendering = false;
    },
    setCurrentPage(state, action) {
      const nextPage = Number(action.payload);
      if (!Number.isInteger(nextPage)) return;
      if (nextPage < 1 || (state.totalPages && nextPage > state.totalPages)) return;
      state.currentPage = nextPage;
      state.progress = state.totalPages
        ? Number(((nextPage / state.totalPages) * 100).toFixed(2))
        : 0;
    },
    setTotalPages(state, action) {
      state.totalPages = Number(action.payload) || 0;
    },
    setZoom(state, action) {
      const nextZoom = Number(action.payload);
      if (!Number.isFinite(nextZoom)) return;
      state.zoom = Math.min(3, Math.max(0.4, nextZoom));
    },
    setRotation(state, action) {
      state.rotation = Number(action.payload) || 0;
    },
    setFitMode(state, action) {
      state.fitMode = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSearchLoading(state, action) {
      state.searchLoading = action.payload;
    },
    setSearchResults(state, action) {
      state.searchResults = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getReaderInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReaderInfo.fulfilled, (state, action) => {
        const reader = action.payload.data || {};
        const isInitialLoad = !state.pdfUrl && !state.book;
        state.loading = false;
        state.book = {
          id: reader.bookId,
          title: reader.title,
          author: reader.author,
        };
        state.totalPages = reader.pageCount || 0;
        state.pdfUrl = reader.pdfUrl || reader.signedUrl || null;
        state.expiresAt = reader.expiresAt || null;
        state.watermark = reader.watermark || null;
        if (isInitialLoad) {
          state.currentPage = reader.progress?.currentPage || 1;
          state.zoom = reader.progress?.zoom || 1;
        }
        state.progress = reader.progress?.progress || 0;
        state.lastReadAt = reader.progress?.lastReadAt || null;
      })
      .addCase(getReaderInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getReadingProgress.pending, (state) => {
        state.progressLoading = true;
      })
      .addCase(getReadingProgress.fulfilled, (state, action) => {
        const progress = action.payload.data || {};
        state.progressLoading = false;
        state.currentPage = progress.currentPage || 1;
        state.zoom = progress.zoom || state.zoom;
        state.progress = progress.progress || 0;
        state.lastReadAt = progress.lastReadAt || null;
      })
      .addCase(getReadingProgress.rejected, (state) => {
        state.progressLoading = false;
      })
      .addCase(saveReadingProgress.pending, (state) => {
        state.savingProgress = true;
      })
      .addCase(saveReadingProgress.fulfilled, (state, action) => {
        state.savingProgress = false;
        const progress = action.payload.data || {};
        state.lastReadAt = progress.lastReadAt || state.lastReadAt;
      })
      .addCase(saveReadingProgress.rejected, (state) => {
        state.savingProgress = false;
      });
  },
});

export const {
  resetReader,
  setCurrentPage,
  setFitMode,
  setReaderError,
  setRendering,
  setRotation,
  setSearchLoading,
  setSearchQuery,
  setSearchResults,
  setTotalPages,
  setZoom,
} = readerSlice.actions;
export default readerSlice.reducer;
