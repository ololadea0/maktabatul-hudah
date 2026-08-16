import api from "../../services/axios.jsx";

export const getNewslettersRequest = () => api.get("/newsletters");
export const getNewsletterRequest = (id) => api.get(`/newsletters/${id}`);
export const createNewsletterRequest = (payload) => api.post("/newsletters", payload);
export const updateNewsletterRequest = (id, payload) => api.put(`/newsletters/${id}`, payload);
export const deleteNewsletterRequest = (id) => api.delete(`/newsletters/${id}`);
export const sendTestNewsletterRequest = (id, email) => api.post(`/newsletters/${id}/test`, { email });
export const sendNewsletterRequest = (id) => api.post(`/newsletters/${id}/send`);
export const subscribeRequest = (email) => api.post("/subscribers", { email });
export const getSubscribersRequest = (params) => api.get("/subscribers", { params });
