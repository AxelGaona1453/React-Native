import { useCallback, useState } from "react";
import { login as loginService, register as registerService } from "../services/champions.service";

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");

  const login = useCallback(async (event) => {
    event.preventDefault();
    try {
      const result = await loginService(authForm.username, authForm.password);
      localStorage.setItem("authToken", result.token);
      setToken(result.token);
      setAuthMessage("");
    } catch (err) {
      setAuthMessage(err.message);
    }
  }, [authForm]);

  const register = useCallback(async (event) => {
    event.preventDefault();
    try {
      await registerService(authForm.username, authForm.password);
      setAuthMessage("Cuenta creada. Ahora inicia sesion.");
      setAuthMode("login");
    } catch (err) {
      setAuthMessage(err.message);
    }
  }, [authForm]);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    setToken("");
    setAuthForm({ username: "", password: "" });
    setAuthMessage("");
  }, []);

  return {
    token,
    authMode,
    authForm,
    authMessage,
    setAuthForm,
    setAuthMode,
    setAuthMessage,
    login,
    register,
    logout,
  };
}

export default useAuth;
