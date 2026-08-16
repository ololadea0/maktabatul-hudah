import api from "./axios.jsx";

export const sendContactMessage = async (payload) => {
  const response = await api.post("/contact", payload);
  return response.data;
};
