import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { setSelectedUser, setUserData } from "./redux/userSlice.js";
import { clearAuthToken, loadAuthToken } from "./utils/authToken.js";

loadAuthToken();

axios.interceptors.response.use(undefined, (error) => {
  const status = error.response?.status;
  const url = error.config?.url || "";
  const isLoginRequest = /\/api\/auth\/(login|signup)/.test(url);

  if (status === 401 && !isLoginRequest) {
    clearAuthToken();
    store.dispatch(setUserData(null));
    store.dispatch(setSelectedUser(null));
  }

  return Promise.reject(error);
});

const configuredServerUrl = (import.meta.env.VITE_SERVER_URL || "").replace(
  /\/$/,
  ""
);

// API traffic stays on the same origin: Vite proxies it in development and
// Vercel rewrites it to the API host in production. This keeps auth cookies
// first-party so they are not blocked as third-party cookies.
export const serverUrl = "";

// Socket.IO cannot use the Vercel rewrite, so connect to the API host directly.
export const socketUrl = configuredServerUrl;

export const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${serverUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
