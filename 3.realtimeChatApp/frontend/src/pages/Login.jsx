import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { serverUrl } from "../main";
import { saveAuthToken } from "../utils/authToken";
import { setSelectedUser, setUserData } from "../redux/userSlice";

const demoAccounts = [
  { label: "Alice", email: "alice@example.com" },
  { label: "Bob", email: "bob@example.com" },
];

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const login = async (emailValue, passwordValue) => {
    setLoading(true);
    setErr("");

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email: emailValue, password: passwordValue },
        { withCredentials: true }
      );
      if (data.token) saveAuthToken(data.token);
      dispatch(setUserData(data.user ?? data));
      dispatch(setSelectedUser(null));
      navigate("/", { replace: true });
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          "Could not log in. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    login(email, password);
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("password123");
    login(demoEmail, "password123");
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-slate-200 p-4">
      <div className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex h-[170px] flex-col items-center justify-center gap-2 rounded-b-[30%] bg-[#20c7ff] px-6 text-center shadow-lg">
          <img src="/logo.png" alt="" className="h-12 w-12 rounded-xl bg-white/90 p-1" />
          <h1 className="text-2xl font-bold text-slate-700">
            Login to <span className="text-white">Chatly</span>
          </h1>
          <p className="text-sm text-white/90">Chat friendly, in real time.</p>
        </div>

        <form className="flex flex-col items-center gap-4 p-6" onSubmit={handleLogin}>
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
                placeholder="password"
                autoComplete="current-password"
                required
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
            {loading ? "Loading..." : "Login"}
          </button>

          <div className="w-full border-t border-slate-200 pt-4">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              Try a demo account
            </p>
            <div className="flex justify-center gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(account.email)}
                  className="rounded-full border border-[#20c7ff] px-5 py-2 text-sm font-semibold text-[#1797c2] transition hover:bg-[#e6f7fd] disabled:opacity-60"
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              Demo users are created by <code>npm run seed</code>.
            </p>
          </div>

          <p className="text-sm text-slate-600">
            New here?{" "}
            <button
              type="button"
              className="font-semibold text-[#1797c2] hover:underline"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
