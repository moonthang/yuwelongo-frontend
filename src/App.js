import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import './App.css';
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import InicioPage from "./pages/public/InicioPage";
import DiccionarioPage from "./pages/public/DiccionarioPage";
import JuegoPage from "./pages/public/JuegoPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// User Pages
import PerfilPage from "./pages/user/PerfilPage";
import FavoritosPage from "./pages/user/FavoritosPages";
import HistorialPage from "./pages/user/HistorialPage";

// Admin Pages
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriasPage from "./pages/admin/AdminCategoriasPage";
import AdminPalabrasPage from "./pages/admin/AdminPalabrasPage";
import AdminNivelesPage from "./pages/admin/AdminNivelesPage";
import AdminPreguntasPage from "./pages/admin/AdminPreguntasPage";

// 404
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          {/* Public */}
          <Route path="/" element={<InicioPage />} />
          <Route path="/diccionario" element={<DiccionarioPage />} />
          <Route path="/juego" element={<JuegoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User */}
          <Route
            path="/perfil"
            element={<ProtectedRoute roles={["USUARIO", "ADMIN"]}><PerfilPage /></ProtectedRoute>}
          />
          <Route
            path="/favoritos"
            element={<ProtectedRoute roles={["USUARIO"]}><FavoritosPage /></ProtectedRoute>}
          />
          <Route
            path="/historial"
            element={<ProtectedRoute roles={["USUARIO"]}><HistorialPage /></ProtectedRoute>}
          />

          {/* Admin */}
          <Route
            path="/admin/usuarios"
            element={<ProtectedRoute roles={["ADMIN"]}><AdminUsersPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/categorias"
            element={<ProtectedRoute roles={["ADMIN"]}><AdminCategoriasPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/palabras"
            element={<ProtectedRoute roles={["ADMIN"]}><AdminPalabrasPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/niveles"
            element={<ProtectedRoute roles={["ADMIN"]}><AdminNivelesPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/preguntas"
            element={<ProtectedRoute roles={["ADMIN"]}><AdminPreguntasPage /></ProtectedRoute>}
          />

          {/* Default */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;