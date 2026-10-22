import axios from "axios";

const TOKEN_KEY = "chatly_token";

let memoryToken = "";

const applyToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const getAuthToken = () => {
  if (memoryToken) return memoryToken;

  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const saveAuthToken = (token) => {
  memoryToken = token || "";

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage can be unavailable in private modes
  }
  applyToken(token);
};

export const clearAuthToken = () => {
  memoryToken = "";

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage can be unavailable in private modes
  }
  applyToken("");
};

export const loadAuthToken = () => {
  const token = getAuthToken();
  memoryToken = token;
  applyToken(token);
  return token;
};
