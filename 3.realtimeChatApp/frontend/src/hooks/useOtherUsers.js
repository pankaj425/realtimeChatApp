import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../main";
import { setOtherUsers } from "../redux/userSlice";

const useOtherUsers = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return undefined;

    let cancelled = false;

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/user/others`, {
          withCredentials: true,
        });
        if (!cancelled) dispatch(setOtherUsers(data));
      } catch (error) {
        if (!cancelled && error.response?.status !== 401) {
          console.error("Could not load users", error);
        }
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    window.addEventListener("focus", fetchUsers);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", fetchUsers);
    };
  }, [userData, dispatch]);
};

export default useOtherUsers;
