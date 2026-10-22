import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../main";
import { setAuthChecked, setUserData } from "../redux/userSlice";

const useCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        if (!cancelled) dispatch(setUserData(data));
      } catch (error) {
        if (!cancelled && error.response?.status !== 401) {
          console.error("Could not load the current user", error);
        }
      } finally {
        if (!cancelled) dispatch(setAuthChecked(true));
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);
};

export default useCurrentUser;
