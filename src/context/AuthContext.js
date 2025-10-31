import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionExpiredModal from "../components/common/SessionExpiredModal";

const AuthContext = createContext();

function AuthController({ children }) {
  const { isSessionExpired, setIsSessionExpired, navigate } = useAuth();

  return (
    <>
      {children}
      <SessionExpiredModal show={isSessionExpired} onClose={() => { setIsSessionExpired(false); navigate('/login'); }} />
    </>
  );
}

export function AuthProvider({ children }) {  
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const token = sessionStorage.getItem("token");
    const nombre = sessionStorage.getItem("nombre");
    const rol = sessionStorage.getItem("rol");
    return token ? { token, nombre, rol } : null;
  });

  const handleSessionExpired = useCallback(() => {
    if (user) {
      setUser(null);
      sessionStorage.clear();
      setIsSessionExpired(true);
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener('session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [handleSessionExpired]);

  const login = (data) => {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("nombre", data.nombre);
    sessionStorage.setItem("rol", data.rol);
    setUser(data);
    navigate("/");
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate("/");
  };

  const value = { user, login, logout, isSessionExpired, setIsSessionExpired, navigate };

  return (
    <AuthContext.Provider value={value}>
      <AuthController>{children}</AuthController>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}