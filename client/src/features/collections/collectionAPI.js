import api from "../../services/axios.jsx";

export const getCollectionsRequest = (params) => api.get("/collections", { params });
export const getCollectionRequest = (id) => api.get(`/collections/${id}`);
export const getCollectionVolumesRequest = (id) => api.get(`/collections/${id}/books`);
export const createCollectionRequest = (payload) => api.post("/collections", payload);
export const updateCollectionRequest = (id, payload) => api.put(`/collections/${id}`, payload);
export const deleteCollectionRequest = (id) => api.delete(`/collections/${id}`);
