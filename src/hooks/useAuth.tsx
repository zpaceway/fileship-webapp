import { useAtom } from "jotai";
import { userAtom } from "../atoms";
import { useCallback, useEffect } from "react";
import { fileshipFetch } from "../api";

const useAuth = () => {
  const [user, setUser] = useAtom(userAtom);

  const requestOTP = useCallback(async (email: string) => {
    const response = await fileshipFetch("/users/otp/request/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
  }, []);

  const validateOTP = useCallback(
    async (email: string, otp: string) => {
      const response = await fileshipFetch("/users/otp/validate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data.user);
      localStorage.setItem("accessToken", data.token.access);
      localStorage.setItem("lastAccessTokenAt", new Date().toISOString());
      localStorage.setItem("refreshToken", data.token.refresh);
    },
    [setUser],
  );

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("lastAccessTokenAt");
    localStorage.removeItem("refreshToken");
  }, [setUser]);

  useEffect(() => {
    fileshipFetch("/users/")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser]);

  return { user, requestOTP, validateOTP, signOut };
};

export default useAuth;
