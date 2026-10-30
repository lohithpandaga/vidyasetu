import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then(({ data }) => setUser(data))
      .catch(() => setUser(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    setUser(data);
    return data;
  };

  const register = async (name, email, password, exam) => {
    const { data } = await api.post("/api/auth/register", { name, email, password, exam });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
