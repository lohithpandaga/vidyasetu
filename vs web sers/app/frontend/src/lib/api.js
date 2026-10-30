import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "",
  withCredentials: true,
});

export const formatApiError = (e) => {
  const detail = e?.response?.data?.detail;
  if (detail == null) return e?.message || "Something went wrong. Try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((x) => x?.msg || JSON.stringify(x)).join(", ");
  if (typeof detail.msg === "string") return detail.msg;
  return String(detail);
};

export default api;
