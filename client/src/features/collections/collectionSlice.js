import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApiErrorMessage } from "../apiError.js";
import {
  createCollectionRequest,
  deleteCollectionRequest,
  getCollectionRequest,
  getCollectionVolumesRequest,
  getCollectionsRequest,
  updateCollectionRequest,
} from "./collectionAPI.js";

const initialState = {
  items: [],
  selectedCollection: null,
  volumes: [],
  status: "idle",
  selectedStatus: "idle",
  volumesStatus: "idle",
  error: null,
};

export const getCollections = createAsyncThunk(
  "collections/getCollections",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await getCollectionsRequest(params);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const getCollection = createAsyncThunk(
  "collections/getCollection",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getCollectionRequest(id);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const getCollectionVolumes = createAsyncThunk(
  "collections/getCollectionVolumes",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getCollectionVolumesRequest(id);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createCollection = createAsyncThunk(
  "collections/createCollection",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await createCollectionRequest(payload);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateCollection = createAsyncThunk(
  "collections/updateCollection",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await updateCollectionRequest(id, payload);
      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteCollection = createAsyncThunk(
  "collections/deleteCollection",
  async (id, { rejectWithValue }) => {
    try {
      await deleteCollectionRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const collectionSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    clearSelectedCollection(state) {
      state.selectedCollection = null;
      state.volumes = [];
      state.selectedStatus = "idle";
      state.volumesStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCollections.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getCollections.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data?.collections || [];
      })
      .addCase(getCollections.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(getCollection.pending, (state) => {
        state.selectedStatus = "loading";
        state.error = null;
      })
      .addCase(getCollection.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selectedCollection = action.payload.data?.collection || null;
        state.volumes = action.payload.data?.collection?.volumes || [];
      })
      .addCase(getCollection.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.error = action.payload;
      })
      .addCase(getCollectionVolumes.pending, (state) => {
        state.volumesStatus = "loading";
      })
      .addCase(getCollectionVolumes.fulfilled, (state, action) => {
        state.volumesStatus = "succeeded";
        state.volumes = action.payload.data?.books || [];
      })
      .addCase(getCollectionVolumes.rejected, (state, action) => {
        state.volumesStatus = "failed";
        state.error = action.payload;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.items = state.items.filter((collection) => collection.id !== action.payload);
        if (state.selectedCollection?.id === action.payload) {
          state.selectedCollection = null;
          state.volumes = [];
        }
      })
      .addMatcher(
        (action) => [createCollection.fulfilled.type, updateCollection.fulfilled.type].includes(action.type),
        (state, action) => {
          const collection = action.payload.data?.collection;
          if (!collection) return;
          const index = state.items.findIndex((item) => item.id === collection.id);
          if (index >= 0) {
            state.items[index] = collection;
          } else {
            state.items.unshift(collection);
          }
          state.selectedCollection = collection;
        },
      );
  },
});

export const { clearSelectedCollection } = collectionSlice.actions;
export default collectionSlice.reducer;
