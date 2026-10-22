import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../main";
import { setAuthChecked, setUserData } from "../redux/userSlice";
import { getAuthToken, saveAuthToken } from "../utils/authToken";

const useCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });

        if (!getAuthToken()) {
          try {
            const { data: refreshed } = await axios.get(
              `${serverUrl}/api/auth/refresh`,
              { withCredentials: true }
            );
            if (refreshed?.token) saveAuthToken(refreshed.token);
          } catch {
            // cookie sessions still work for API calls
          }
        }

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
