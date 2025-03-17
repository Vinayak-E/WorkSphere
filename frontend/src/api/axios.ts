import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      store.dispatch(logout());
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    } 
    else if (status === 403 && data?.redirectTo) {
      alert(data.message); 
      window.location.href = data.redirectTo; 
    }

    return Promise.reject(error);
  },
);

export default api;
