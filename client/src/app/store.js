import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import bookReducer from "../features/books/bookSlice.js";
import categoryReducer from "../features/categories/categorySlice.js";
import collectionReducer from "../features/collections/collectionSlice.js";
import newsletterReducer from "../features/newsletters/newsletterSlice.js";
import readerReducer from "../features/reader/readerSlice.js";
import savedBookReducer from "../features/savedBooks/savedBookSlice.js";
import userReducer from "../features/users/userSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    categories: categoryReducer,
    collections: collectionReducer,
    newsletters: newsletterReducer,
    reader: readerReducer,
    savedBooks: savedBookReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
