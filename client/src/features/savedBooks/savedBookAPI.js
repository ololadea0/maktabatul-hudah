import api from "../../services/axios.jsx";

export const saveBookRequest = (bookId) => api.post(`/books/${bookId}/save`);

export const unsaveBookRequest = (bookId) => api.delete(`/books/${bookId}/save`);

export const fetchSavedBooksRequest = () => api.get("/users/me/saved-books");

export const fetchSaveStatusRequest = (bookId) =>
  api.get(`/books/${bookId}/save-status`);
