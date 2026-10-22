import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import dp from "../assets/dp.webp";
import { resolveMediaUrl, serverUrl } from "../main";
import {
  setOtherUsers,
  setSelectedUser,
  setUserData,
} from "../redux/userSlice";

const displayName = (user) => user?.name || user?.userName || "Unknown user";

function Avatar({ user, online, size = "h-[52px] w-[52px]" }) {
  return (
    <div className="relative shrink-0">
      <div className={`${size} overflow-hidden rounded-full bg-white shadow-md`}>
        <img
          src={resolveMediaUrl(user?.image) || dp}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}

function SideBar() {
  const { userData, otherUsers, selectedUser, onlineUsers } = useSelector(
    (state) => state.user
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const sortedUsers = useMemo(() => {
    const online = new Set(onlineUsers);
    return [...(otherUsers || [])].sort((a, b) => {
      const onlineDiff = Number(online.has(b._id)) - Number(online.has(a._id));
      if (onlineDiff !== 0) return onlineDiff;
      return displayName(a).localeCompare(displayName(b));
    });
  }, [otherUsers, onlineUsers]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/user/search`, {
          params: { query: trimmed },
          withCredentials: true,
        });
        setResults(data);
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Search failed", error);
        }
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  const selectUser = (user) => {
    dispatch(setSelectedUser(user));
    closeSearch();
  };

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch(setUserData(null));
      dispatch(setOtherUsers([]));
      dispatch(setSelectedUser(null));
      navigate("/login", { replace: true });
    }
  };

  const list = searchOpen ? results : sortedUsers;
  const showEmptyList = !searchOpen && list.length === 0;

  return (
    <aside
      className={`h-full w-full shrink-0 flex-col bg-slate-200 lg:flex lg:w-[32%] lg:max-w-[420px] ${
        selectedUser ? "hidden lg:flex" : "flex"
      }`}
    >
      <header className="rounded-b-[28px] bg-[#20c7ff] px-5 pb-5 pt-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg bg-white/90 p-0.5" />
            <h1 className="text-xl font-bold text-white">chatly</h1>
          </div>
          <button
            type="button"
            aria-label="Log out"
            className="rounded-full bg-white/90 p-2 text-slate-700 shadow-md transition hover:bg-white"
            onClick={handleLogOut}
          >
            <BiLogOutCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-800">
              Hi, {displayName(userData)}
            </p>
            <p className="text-xs font-medium text-slate-700/80">
              {onlineUsers.length} online now
            </p>
          </div>
          <button
            type="button"
            aria-label="Open profile"
            className="shrink-0 rounded-full border-2 border-white shadow-lg"
            onClick={() => navigate("/profile")}
          >
            <Avatar user={userData} />
          </button>
        </div>
      </header>

      <div className="px-4 py-4">
        {searchOpen ? (
          <form
            className="flex h-[48px] items-center gap-2 rounded-full bg-white px-4 shadow-md"
            onSubmit={(event) => event.preventDefault()}
          >
            <IoIosSearch className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name, username or email"
              className="h-full w-full bg-transparent text-[15px] text-slate-700 outline-none"
              onChange={(event) => setQuery(event.target.value)}
              value={query}
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={closeSearch}
              className="text-slate-500"
            >
              <RxCross2 className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="flex h-[48px] w-full items-center gap-2 rounded-full bg-white px-4 text-slate-500 shadow-md transition hover:shadow-lg"
            onClick={() => setSearchOpen(true)}
          >
            <IoIosSearch className="h-5 w-5" />
            <span className="text-[15px]">Search people...</span>
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        {searchOpen && query.trim() && (
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {searching ? "Searching..." : `${results.length} result(s)`}
          </p>
        )}

        {searchOpen && query.trim() && !searching && results.length === 0 && (
          <p className="rounded-lg bg-white/70 p-4 text-sm text-slate-500">
            No people found for “{query.trim()}”.
          </p>
        )}

        {showEmptyList && (
          <div className="rounded-xl bg-white/70 p-5 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-600">No other users yet</p>
            <p className="mt-1">
              Open this app in another browser or run <code>npm run seed</code>{" "}
              to create demo users.
            </p>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {list.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <li key={user._id}>
                <button
                  type="button"
                  onClick={() => selectUser(user)}
                  className={`flex w-full items-center gap-3 rounded-full px-3 py-2 text-left shadow-md transition ${
                    isSelected
                      ? "bg-[#1797c2] text-white"
                      : "bg-white text-slate-700 hover:bg-[#d9f3fc]"
                  }`}
                >
                  <Avatar user={user} online={isOnline} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">
                      {displayName(user)}
                    </span>
                    <span
                      className={`block truncate text-xs ${
                        isSelected ? "text-white/80" : "text-slate-400"
                      }`}
                    >
                      {isOnline ? "Online" : user.email || `@${user.userName}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export default SideBar;
