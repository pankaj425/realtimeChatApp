import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../main";
import {
  clearMessages,
  setMessages,
  setMessagesLoading,
} from "../redux/messageSlice";

const useMessages = () => {
  const dispatch = useDispatch();
  const { userData, selectedUser } = useSelector((state) => state.user);
  const selectedId = selectedUser?._id;

  useEffect(() => {
    if (!userData || !selectedId) {
      dispatch(clearMessages());
      return undefined;
    }

    let cancelled = false;
    dispatch(clearMessages());
    dispatch(setMessagesLoading(true));

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${serverUrl}/api/message/get/${selectedId}`,
          { withCredentials: true }
        );
        if (!cancelled) dispatch(setMessages(data));
      } catch (error) {
        if (!cancelled && error.response?.status !== 401) {
          console.error("Could not load messages", error);
        }
      } finally {
        if (!cancelled) dispatch(setMessagesLoading(false));
      }
    };

    fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [selectedId, userData, dispatch]);
};

export default useMessages;
