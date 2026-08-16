export const selectSavedBooks = (state) => state.savedBooks.savedBooks;

export const selectSavedBookIds = (state) => state.savedBooks.savedBookIds;

export const selectIsBookSaved = (bookId) => (state) =>
  Boolean(bookId && state.savedBooks.savedBookIds[bookId]);

export const selectSaveActionStatus = (bookId) => (state) =>
  state.savedBooks.actionStatusByBookId[bookId] || "idle";

export const selectSaveStatusLoading = (bookId) => (state) =>
  state.savedBooks.statusByBookId[bookId] === "loading";
