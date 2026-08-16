import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../apiError.js";
import {
  createNewsletterRequest,
  deleteNewsletterRequest,
  getNewsletterRequest,
  getNewslettersRequest,
  sendNewsletterRequest,
  sendTestNewsletterRequest,
  updateNewsletterRequest,
} from "./newsletterAPI.js";

const initialState = {
  items: [],
  selectedNewsletter: null,
  activeSubscriberCount: 0,
  loading: false,
  error: null,
};

export const fetchNewsletters = createAsyncThunk(
  "newsletters/fetchNewsletters",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getNewslettersRequest();
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchNewsletter = createAsyncThunk(
  "newsletters/fetchNewsletter",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getNewsletterRequest(id);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createNewsletter = createAsyncThunk(
  "newsletters/createNewsletter",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createNewsletterRequest(payload);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateNewsletter = createAsyncThunk(
  "newsletters/updateNewsletter",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateNewsletterRequest(id, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteNewsletter = createAsyncThunk(
  "newsletters/deleteNewsletter",
  async (id, { rejectWithValue }) => {
    try {
      await deleteNewsletterRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const sendTestNewsletter = createAsyncThunk(
  "newsletters/sendTestNewsletter",
  async ({ id, email }, { rejectWithValue }) => {
    try {
      const { data } = await sendTestNewsletterRequest(id, email);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const sendNewsletter = createAsyncThunk(
  "newsletters/sendNewsletter",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await sendNewsletterRequest(id);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const upsertNewsletter = (state, newsletter) => {
  if (!newsletter) return;
  const index = state.items.findIndex((item) => item.id === newsletter.id);

  if (index >= 0) {
    state.items[index] = newsletter;
  } else {
    state.items.unshift(newsletter);
  }

  state.selectedNewsletter = newsletter;
};

const newsletterSlice = createSlice({
  name: "newsletters",
  initialState,
  reducers: {
    clearSelectedNewsletter(state) {
      state.selectedNewsletter = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsletters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.newsletters || [];
        state.activeSubscriberCount = action.payload.data?.activeSubscriberCount || 0;
      })
      .addCase(fetchNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedNewsletter = action.payload.data?.newsletter || null;
      })
      .addCase(createNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        upsertNewsletter(state, action.payload.data?.newsletter);
      })
      .addCase(updateNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        upsertNewsletter(state, action.payload.data?.newsletter);
      })
      .addCase(sendNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        upsertNewsletter(state, action.payload.data?.newsletter);
      })
      .addCase(sendTestNewsletter.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedNewsletter?.id === action.payload) {
          state.selectedNewsletter = null;
        }
      })
      .addMatcher(
        (action) =>
          [
            fetchNewsletters.pending.type,
            fetchNewsletter.pending.type,
            createNewsletter.pending.type,
            updateNewsletter.pending.type,
            deleteNewsletter.pending.type,
            sendTestNewsletter.pending.type,
            sendNewsletter.pending.type,
          ].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) => action.type.startsWith("newsletters/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearSelectedNewsletter } = newsletterSlice.actions;
export default newsletterSlice.reducer;
