import React, { useEffect, useRef } from "react";
import axios from "axios";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import useCurrentUser from "./hooks/useCurrentUser";
import useOtherUsers from "./hooks/useOtherUsers";
import { serverUrl, socketUrl } from "./main";
import {
  clearUnread,
  incrementUnread,
  setOnlineUsers,
  setOtherUsers,
  setSelectedUser,
  setSocket,
} from "./redux/userSlice";
import { getAuthToken } from "./utils/authToken";

function App() {
  useCurrentUser();
  useOtherUsers();

  const { userData, authChecked, selectedUser, otherUsers, socket } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  const userId = userData?._id;

  const selectedUserRef = useRef(null);
  const otherUsersRef = useRef([]);

  useEffect(() => {
    selectedUserRef.current = selectedUser || null;
  }, [selectedUser]);

  useEffect(() => {
    otherUsersRef.current = otherUsers || [];
  }, [otherUsers]);

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io(socketUrl || window.location.origin, {
      auth: { token: getAuthToken() },
      query: { userId },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    dispatch(setSocket(socket));

    socket.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("connect_error", (error) => {
      console.warn("Realtime connection problem:", error.message);
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("connect_error");
      socket.close();
      dispatch(setSocket(null));
    };
  }, [userId, dispatch]);

  useEffect(() => {
    if (!socket || !userId) return undefined;

    const handleIncoming = async (message) => {
      if (!message?._id || String(message.sender) === String(userId)) return;

      const senderId = String(message.sender);
      const current = selectedUserRef.current;

      if (current && String(current._id) === senderId) return;

      let sender = otherUsersRef.current.find(
        (user) => String(user._id) === senderId
      );

      if (!sender) {
        try {
          const { data } = await axios.get(`${serverUrl}/api/user/others`, {
            withCredentials: true,
          });
          dispatch(setOtherUsers(data));
          sender = (data || []).find(
            (user) => String(user._id) === senderId
          );
        } catch {
          // keep the unread badge even if the user list cannot refresh
        }
      }

      if (!current && sender) {
        dispatch(clearUnread(senderId));
        dispatch(setSelectedUser(sender));
        return;
      }

      dispatch(incrementUnread(senderId));
    };

    socket.on("newMessage", handleIncoming);
    return () => socket.off("newMessage", handleIncoming);
  }, [socket, userId, dispatch]);

  if (!authChecked) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 bg-slate-200">
        <img src="/logo.png" alt="Chatly" className="h-16 w-16 rounded-2xl shadow-lg" />
        <p className="text-lg font-semibold text-slate-600">Loading Chatly...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!userData ? <Login /> : <Navigate to="/" replace />} />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/profile" replace />}
      />
      <Route path="/" element={userData ? <Home /> : <Navigate to="/login" replace />} />
      <Route
        path="/profile"
        element={userData ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={userData ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
