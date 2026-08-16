export const selectReader = (state) => state.reader;

export const selectReaderBook = (state) => state.reader.book;

export const selectReaderCanGoPrevious = (state) => state.reader.currentPage > 1;

export const selectReaderCanGoNext = (state) =>
  state.reader.totalPages > 0 && state.reader.currentPage < state.reader.totalPages;
