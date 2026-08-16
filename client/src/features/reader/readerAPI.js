import api from "../../services/axios.jsx";

export const fetchReaderInfoRequest = (bookId) => api.get(`/books/${bookId}/reader`);

export const fetchReadingProgressRequest = (bookId) =>
  api.get(`/books/${bookId}/progress`);

export const saveReadingProgressRequest = ({ bookId, currentPage, zoom }) =>
  api.put(`/books/${bookId}/progress`, { currentPage, zoom });
