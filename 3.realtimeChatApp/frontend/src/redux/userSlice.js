import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    authChecked: false,
    otherUsers: [],
    selectedUser: null,
    socket: null,
    onlineUsers: [],
    unreadByUser: {},
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload || [];
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },
    incrementUnread: (state, action) => {
      const id = String(action.payload);
      state.unreadByUser[id] = (state.unreadByUser[id] || 0) + 1;
    },
    clearUnread: (state, action) => {
      delete state.unreadByUser[String(action.payload)];
    },
    clearAllUnread: (state) => {
      state.unreadByUser = {};
    },
  },
});

export const {
  setUserData,
  setAuthChecked,
  setOtherUsers,
  setSelectedUser,
  setSocket,
  setOnlineUsers,
  incrementUnread,
  clearUnread,
  clearAllUnread,
} = userSlice.actions;
export default userSlice.reducer;
