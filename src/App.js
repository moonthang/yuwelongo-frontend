import React, { Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastNotification";
import './App.css';
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/ui/Loader/Loader";

// Public Pages
import InicioPage from "./pages/public/InicioPage/InicioPage";
import DiccionarioPage from "./pages/public/diccionarioPage/DiccionarioPage";
import CategoriaPalabrasPage from "./pages/public/diccionarioPage/CategoriaPalabrasPage";
import JuegoPage from "./pages/public/juegoPage/JuegoPage";
import JuegoPreviewPage from "./pages/public/juegoPage/JuegoPreviewPage";
import RankingPage from "./pages/public/juegoPage/RankingPage";
import CategoriasPage from "./pages/public/diccionarioPage/CategoriasPage";
import LoginPage from "./pages/public/loginPage/LoginPage";
import RegisterPage from "./pages/public/registerPage/RegisterPage";

// User Pages
import PerfilPage from "./pages/user/perfilPage/PerfilPage";
import FavoritosPage from "./pages/user/favoritoPage/FavoritosPages";
import HistorialPage from "./pages/user/historialPage/HistorialPage";

// Admin Pages
import AdminUsersPage from "./pages/admin/adminUsersPage/AdminUsersPage";
import AdminCategoriasPage from "./pages/admin/adminCategoriasPage/AdminCategoriasPage";
import AdminPalabrasPage from "./pages/admin/adminPalabrasPage/AdminPalabrasPage";
import AdminNivelesPage from "./pages/admin/adminNivelesPage/AdminNivelesPage";
import AdminPreguntasPage from "./pages/admin/adminPreguntasPage/AdminPreguntasPage";

// 404
import NotFoundPage from "./pages/NotFoundPage";

function AppLayout() {
  const navigation = useNavigation();

  return (
    <>
      <Header />
      <ToastContainer position="bottom-right" />
      <Suspense fallback={<Loader />}>
        {navigation.state === 'loading' ? <Loader /> : <Outlet />}
      </Suspense>
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    ),
    children: [
      // Public
      { path: "/", element: <InicioPage /> },
      { path: "/diccionario", element: <DiccionarioPage /> },
      { path: "/categorias", element: <CategoriasPage /> },
      { path: "/diccionario/categoria/:id", element: <CategoriaPalabrasPage /> },
      { path: "/juego", element: <JuegoPage /> },
      { path: "/juego-preview", element: <JuegoPreviewPage /> },
      { path: "/ranking", element: <RankingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      // User
      {
        path: "/perfil",
        element: <ProtectedRoute roles={["USUARIO", "ADMIN"]}><PerfilPage /></ProtectedRoute>,
      },
      {
        path: "/favoritos",
        element: <ProtectedRoute roles={["USUARIO"]}><FavoritosPage /></ProtectedRoute>,
      },
      {
        path: "/historial",
        element: <ProtectedRoute roles={["USUARIO"]}><HistorialPage /></ProtectedRoute>,
      },
      // Admin
      {
        path: "/admin/usuarios",
        element: <ProtectedRoute roles={["ADMIN"]}><AdminUsersPage /></ProtectedRoute>,
      },
      {
        path: "/admin/categorias",
        element: <ProtectedRoute roles={["ADMIN"]}><AdminCategoriasPage /></ProtectedRoute>,
      },
      {
        path: "/admin/palabras",
        element: <ProtectedRoute roles={["ADMIN"]}><AdminPalabrasPage /></ProtectedRoute>,
      },
      {
        path: "/admin/niveles",
        element: <ProtectedRoute roles={["ADMIN"]}><AdminNivelesPage /></ProtectedRoute>,
      },
      {
        path: "/admin/preguntas",
        element: <ProtectedRoute roles={["ADMIN"]}><AdminPreguntasPage /></ProtectedRoute>,
      },
      // 404
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;