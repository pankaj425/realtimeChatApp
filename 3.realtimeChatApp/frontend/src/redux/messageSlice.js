import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    loading: false,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload || [];
    },
    appendMessage: (state, action) => {
      const message = action.payload;
      if (!message?._id) return;
      if (state.messages.some((item) => item._id === message._id)) return;
      state.messages.push(message);
    },
    setMessagesLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setMessages,
  appendMessage,
  setMessagesLoading,
  clearMessages,
} = messageSlice.actions;
export default messageSlice.reducer;
