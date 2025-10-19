# 🌊 YuweLongo - Frontend V0.1

[![Estado del Proyecto](https://img.shields.io/badge/estado-en%20desarrollo-yellowgreen)](https://github.com/moonthang/yuwelongo-frontend)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🚀 Descripción del Proyecto

**YuweLongo** es un diccionario interactivo sobre la lengua indígena **Nasa Yuwe**, acompañado de un **juego educativo**.  
Esta versión web (**V0.1**) está enfocada en la **gestión de usuarios**, con operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para el rol **Administrador (`ADMIN`)**.

> ⚠️ *Aún falta mejorar la parte visual e integrar la lógica completa del juego y las categorías.*

El frontend está construido con **React**, utilizando **Vite** para el entorno de desarrollo.  
Se conecta con un **Backend Java (Jakarta EE / Servlets)** que maneja la autenticación mediante **JWT** (JSON Web Tokens).

---

## 📚 Tabla de Contenido

1. [🚀 Descripción del Proyecto](#-descripción-del-proyecto)
2. [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
3. [🧱 Estructura del Proyecto](#-estructura-del-proyecto)
4. [⚙️ Configuración del Entorno](#️-configuración-del-entorno)
   1. [1️⃣ Prerrequisitos](#1️⃣-prerrequisitos)
   2. [2️⃣ Instalación de Dependencias](#2️⃣-instalación-de-dependencias)
5. [👨‍💻 Autores](#-autores)

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología | Uso Principal |
|:--|:--|:--|
| **Frontend** | <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="20"/> React (JavaScript) | Componentes, Hooks (`useState`, `useEffect`) |
| **Entorno de desarrollo** | <img src="https://vitejs.dev/logo.svg" width="20"/> Vite | Servidor rápido de desarrollo y build optimizado |
| **Formularios** | Formik + Yup | Manejo y validación de formularios |
| **Comunicación API** | `fetch` API / `userService.js` | Peticiones HTTP al backend |
| **Backend asociado** | <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Jakarta_EE_logo.svg" width="20"/> Java Servlets (Jakarta EE) | API RESTful |
| **Seguridad** | <img src="https://jwt.io/img/pic_logo.svg" width="20"/> JWT (JSON Web Tokens) | Autenticación y sesiones |
| **Estilos** | CSS | Diseño y estructura visual |

---

## 🧱 Estructura del Proyecto
yuwelongo-frontend/
├── src/
│ ├── components/ # Componentes reutilizables (Botones, Formularios, Tablas)
│ ├── pages/ # Páginas principales (Login, Dashboard, Usuarios)
│ ├── services/ # Lógica de conexión con la API (userService.js)
│ ├── context/ # Contextos globales (AuthContext)
│ ├── hooks/ # Hooks personalizados
│ ├── styles/ # Archivos CSS
│ └── main.jsx # Punto de entrada de la aplicación
├── public/
├── .env
├── package.json
└── README.md

## ⚙️ Configuración del Entorno

### 1️⃣ Prerrequisitos

Asegúrate de tener instalado en tu equipo:

- 🟩 **Node.js** (v18 o superior) y **npm**
- 🟦 **Git**
- 🔧 El **Backend YuweLongo** ejecutándose en local o remoto  
  👉 [Repositorio del Backend](https://github.com/moonthang/yuwelongo-backend)

---

### 2️⃣ Instalación de Dependencias

Sigue estos pasos para configurar el proyecto localmente:

---

### Pasos de Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone [https://github.com/moonthang/yuwelongo-frontend](https://github.com/moonthang/yuwelongo-frontend)
    ```
2.  **Acceder a la carpeta del proyecto**:
    ```bash
    cd yuwelongo-frontend
    ```
3.  **Instalar dependencias**:
    ```bash
    npm install
    ```
4.  **Ejecutar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

## 👨‍💻 Autores

**YuweLongo - Frontend** fue desarrollado por **Miguel Angel Sepulveda Burgos** y **Faeli Yobana Nez Fiole**.

*   <img src="https://cdn.worldvectorlogo.com/logos/github-icon-2.svg" width="20" height="20"/> GitHub: [@moonthang](https://github.com/moonthang)
*   <img src="https://static.vecteezy.com/system/resources/previews/018/930/480/non_2x/linkedin-logo-linkedin-icon-transparent-free-png.png" width="20" height="20"/> LinkedIn: [Miguel Ángel Sepulveda Burgos](https://www.linkedin.com/in/miguel-%C3%A1ngel-sep%C3%BAlveda-burgos-a87808167/)