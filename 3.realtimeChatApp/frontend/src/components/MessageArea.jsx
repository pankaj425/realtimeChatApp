import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { RiEmojiStickerLine, RiSendPlane2Fill } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import dp from "../assets/dp.webp";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import { resolveMediaUrl, serverUrl } from "../main";
import { setSelectedUser } from "../redux/userSlice";
import { appendMessage } from "../redux/messageSlice";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function MessageArea() {
  const { selectedUser, userData, socket, onlineUsers } = useSelector(
    (state) => state.user
  );
  const { messages, loading } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const [showPicker, setShowPicker] = useState(false);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const imageInput = useRef();
  const endRef = useRef();
  const selectedId = selectedUser?._id;
  const isOnline = selectedId ? onlineUsers.includes(selectedId) : false;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, selectedId]);

  useEffect(() => {
    if (!socket || !selectedId) return undefined;

    const handleNewMessage = (message) => {
      const belongsToChat =
        String(message.sender) === String(selectedId) ||
        String(message.receiver) === String(selectedId);

      if (belongsToChat) {
        dispatch(appendMessage(message));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedId, dispatch]);

  useEffect(() => {
    setInput("");
    setPreview(null);
    setBackendImage(null);
    setShowPicker(false);
    setError("");
  }, [selectedId]);

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setBackendImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const clearImage = () => {
    setBackendImage(null);
    setPreview(null);
    if (imageInput.current) imageInput.current.value = "";
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!selectedUser || sending) return;
    if (!input.trim() && !backendImage) return;

    setSending(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("message", input);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const { data } = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      dispatch(appendMessage(data));
      setInput("");
      clearImage();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not send the message. Check your connection."
      );
    } finally {
      setSending(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput((previous) => previous + emojiData.emoji);
  };

  return (
    <section
      className={`relative h-full min-h-0 flex-1 flex-col border-l border-slate-300 bg-slate-200 lg:flex ${
        selectedUser ? "flex" : "hidden"
      }`}
    >
      {selectedUser ? (
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex shrink-0 items-center gap-3 bg-[#1797c2] px-3 py-3 text-white shadow-lg sm:px-5">
            <button
              type="button"
              aria-label="Back to conversations"
              className="rounded-full p-1 transition hover:bg-white/15"
              onClick={() => dispatch(setSelectedUser(null))}
            >
              <IoIosArrowRoundBack className="h-8 w-8" />
            </button>

            <div className="h-[46px] w-[46px] shrink-0 overflow-hidden rounded-full bg-white shadow-md">
              <img
                src={resolveMediaUrl(selectedUser.image) || dp}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">
                {selectedUser.name || selectedUser.userName}
              </h2>
              <p className="text-xs text-white/80">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                <p className="text-lg font-semibold text-slate-600">
                  Say hello to {selectedUser.name || selectedUser.userName}
                </p>
                <p className="mt-1 text-sm">
                  Your messages will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) =>
                  String(message.sender) === String(userData?._id) ? (
                    <SenderMessage
                      key={message._id}
                      image={message.image}
                      message={message.message}
                      createdAt={message.createdAt}
                    />
                  ) : (
                    <ReceiverMessage
                      key={message._id}
                      image={message.image}
                      message={message.message}
                      createdAt={message.createdAt}
                    />
                  )
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {showPicker && (
            <div className="absolute bottom-[96px] right-3 z-50 sm:right-6">
              <Suspense
                fallback={
                  <div className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-lg">
                    Loading emojis...
                  </div>
                }
              >
                <EmojiPicker
                  width={280}
                  height={360}
                  onEmojiClick={onEmojiClick}
                  lazyLoadEmojis
                />
              </Suspense>
            </div>
          )}

          <div className="shrink-0 px-3 pb-3 pt-2 sm:px-5 sm:pb-5">
            {preview && (
              <div className="mb-2 flex items-center gap-2 rounded-xl bg-white p-2 shadow-md">
                <img
                  src={preview}
                  alt="Selected attachment"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <p className="flex-1 text-xs text-slate-500">
                  Ready to send. Add a caption if you like.
                </p>
                <button
                  type="button"
                  aria-label="Remove attachment"
                  className="rounded-full bg-slate-100 p-1 text-slate-600"
                  onClick={clearImage}
                >
                  <RxCross2 className="h-5 w-5" />
                </button>
              </div>
            )}

            {error && (
              <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <form
              className="flex h-[56px] items-center gap-2 rounded-full bg-white px-3 shadow-lg sm:gap-3 sm:px-4"
              onSubmit={handleSendMessage}
            >
              <button
                type="button"
                aria-label="Choose an emoji"
                className="shrink-0 text-[#1797c2]"
                onClick={() => setShowPicker((previous) => !previous)}
              >
                <RiEmojiStickerLine className="h-6 w-6" />
              </button>

              <input
                type="file"
                accept="image/*"
                ref={imageInput}
                hidden
                onChange={handleImage}
              />

              <button
                type="button"
                aria-label="Attach an image"
                className="shrink-0 text-[#1797c2]"
                onClick={() => imageInput.current?.click()}
              >
                <FaImages className="h-6 w-6" />
              </button>

              <input
                type="text"
                className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Write a message..."
                onChange={(event) => setInput(event.target.value)}
                value={input}
                autoFocus
              />

              <button
                type="submit"
                aria-label="Send message"
                disabled={sending || (!input.trim() && !backendImage)}
                className="shrink-0 rounded-full bg-[#1797c2] p-2 text-white transition hover:bg-[#0f7fa7] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RiSendPlane2Fill className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <img src="/logo.png" alt="" className="h-16 w-16 rounded-2xl shadow-lg" />
          <h1 className="text-3xl font-bold text-slate-700 sm:text-4xl">
            Welcome to Chatly
          </h1>
          <p className="max-w-sm text-slate-500">
            Pick a person from the list to start chatting in real time.
          </p>
        </div>
      )}
    </section>
  );
}

export default MessageArea;
