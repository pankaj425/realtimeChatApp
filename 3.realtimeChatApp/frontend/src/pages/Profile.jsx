import React, { useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoCameraOutline } from "react-icons/io5";
import { IoIosArrowRoundBack } from "react-icons/io";
import dp from "../assets/dp.webp";
import { resolveMediaUrl, serverUrl } from "../main";
import { setUserData } from "../redux/userSlice";

function Profile() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imageInput = useRef();

  const [name, setName] = useState(userData?.name || "");
  const [frontendImage, setFrontendImage] = useState(
    resolveMediaUrl(userData?.image) || dp
  );
  const [backendImage, setBackendImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
    setErr("");
  };

  const handleProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErr("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const { data } = await axios.put(`${serverUrl}/api/user/profile`, formData, {
        withCredentials: true,
      });
      dispatch(setUserData(data));
      navigate("/", { replace: true });
    } catch (error) {
      setErr(error.response?.data?.message || "Could not save the profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-6 bg-slate-200 p-4">
      <button
        type="button"
        aria-label="Back to chat"
        className="fixed left-4 top-4 rounded-full bg-white p-2 text-slate-600 shadow-lg"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack className="h-8 w-8" />
      </button>

      <button
        type="button"
        aria-label="Choose a profile photo"
        className="relative rounded-full border-4 border-[#20c7ff] bg-white shadow-lg"
        onClick={() => imageInput.current?.click()}
      >
        <div className="flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full">
          <img
            src={frontendImage}
            alt="Profile preview"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#20c7ff] shadow-lg">
          <IoCameraOutline className="h-6 w-6 text-slate-700" />
        </span>
      </button>

      <form
        className="flex w-[95%] max-w-[500px] flex-col items-center gap-4"
        onSubmit={handleProfile}
      >
        <input
          type="file"
          accept="image/*"
          ref={imageInput}
          hidden
          onChange={handleImage}
        />

        <label className="w-full">
          <span className="mb-1 block text-sm font-semibold text-slate-600">
            Display name
          </span>
          <input
            type="text"
            placeholder="Enter your name"
            className="h-[50px] w-full rounded-lg border-2 border-[#20c7ff] bg-white px-5 text-[17px] text-slate-700 outline-none focus:border-[#1797c2]"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>

        <label className="w-full">
          <span className="mb-1 block text-sm font-semibold text-slate-600">
            Username
          </span>
          <input
            type="text"
            readOnly
            className="h-[50px] w-full rounded-lg border-2 border-slate-300 bg-white px-5 text-[17px] text-slate-400 outline-none"
            value={userData?.userName || ""}
          />
        </label>

        <label className="w-full">
          <span className="mb-1 block text-sm font-semibold text-slate-600">
            Email
          </span>
          <input
            type="email"
            readOnly
            className="h-[50px] w-full rounded-lg border-2 border-slate-300 bg-white px-5 text-[17px] text-slate-400 outline-none"
            value={userData?.email || ""}
          />
        </label>

        {err && (
          <p className="w-full rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {err}
          </p>
        )}

        <div className="mt-2 flex gap-3">
          <button
            type="submit"
            className="h-[48px] w-[160px] rounded-2xl bg-[#20c7ff] text-lg font-semibold text-white shadow-lg transition hover:bg-[#1797c2] disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="h-[48px] w-[120px] rounded-2xl border-2 border-slate-300 bg-white text-lg font-semibold text-slate-600"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
