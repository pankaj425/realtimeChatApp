import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { serverUrl } from "../main";
import { saveAuthToken } from "../utils/authToken";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { userName: userName.trim(), email: email.trim(), password },
        { withCredentials: true }
      );
      if (data.token) saveAuthToken(data.token);
      dispatch(setUserData(data.user ?? data));
      navigate("/profile", { replace: true });
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Could not create the account. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-slate-200 p-4">
      <div className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex h-[170px] flex-col items-center justify-center gap-2 rounded-b-[30%] bg-[#20c7ff] px-6 text-center shadow-lg">
          <img src="/logo.png" alt="" className="h-12 w-12 rounded-xl bg-white/90 p-1" />
          <h1 className="text-2xl font-bold text-slate-700">
            Welcome to <span className="text-white">Chatly</span>
          </h1>
          <p className="text-sm text-white/90">Create an account in seconds.</p>
        </div>

        <form className="flex flex-col items-center gap-4 p-6" onSubmit={handleSignUp}>
          <label className="w-full">
            <span className="sr-only">Username</span>
            <input
              type="text"
              placeholder="username"
              autoComplete="username"
              required
              minLength={3}
              className="h-[50px] w-full rounded-lg border-2 border-[#20c7ff] px-5 text-[17px] text-slate-700 outline-none focus:border-[#1797c2]"
              onChange={(event) => setUserName(event.target.value)}
              value={userName}
            />
          </label>

          <label className="w-full">
            <span className="sr-only">Email</span>
            <input
              type="email"
              placeholder="email"
              autoComplete="email"
              required
              className="h-[50px] w-full rounded-lg border-2 border-[#20c7ff] px-5 text-[17px] text-slate-700 outline-none focus:border-[#1797c2]"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </label>

          <div className="relative w-full">
            <label className="w-full">
              <span className="sr-only">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="password (min 6 characters)"
                autoComplete="new-password"
                required
                minLength={6}
                className="h-[50px] w-full rounded-lg border-2 border-[#20c7ff] px-5 pr-20 text-[17px] text-slate-700 outline-none focus:border-[#1797c2]"
                onChange={(event) => setPassword(event.target.value)}
                value={password}
              />
            </label>
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1797c2]"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "hide" : "show"}
            </button>
          </div>

          {err && (
            <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {err}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 h-[48px] w-[200px] rounded-2xl bg-[#20c7ff] text-lg font-semibold text-white shadow-lg transition hover:bg-[#1797c2] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-[#1797c2] hover:underline"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
