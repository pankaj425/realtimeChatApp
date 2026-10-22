import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import useCurrentUser from "./hooks/useCurrentUser";
import useOtherUsers from "./hooks/useOtherUsers";
import { serverUrl } from "./main";
import { setOnlineUsers, setSocket } from "./redux/userSlice";
import { getAuthToken } from "./utils/authToken";

function App() {
  useCurrentUser();
  useOtherUsers();

  const { userData, authChecked } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const userId = userData?._id;

  useEffect(() => {
    if (!userId) return undefined;

    const socket = io(serverUrl || window.location.origin, {
      auth: { token: getAuthToken() },
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
