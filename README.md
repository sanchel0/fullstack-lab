# Fullstack Lab

Este es un proyecto Fullstack diseñado como un entorno de experimentación y aprendizaje (sandbox), enfocado en la implementación de una arquitectura robusta, sistemas de autenticación segura y gestión eficiente de datos.

La aplicación permite la administración completa de usuarios mediante roles, así como un sistema personal de gestión de notas, integrando tecnologías modernas tanto en el frontend como en el backend.

## Características Principales
### Backend (Node.js)
Arquitectura MVC: Código organizado en Controladores, Modelos, Rutas, Servicios y Middlewares.

Autenticación & Autorización: Sistema basado en roles (RBAC) para el acceso a recursos.

Rendimiento: Implementación de Redis para el manejo de sesiones y caché.

Seguridad: Middlewares personalizados para validación de datos y protección de rutas.

Testing: Suite de pruebas unitarias y de integración para garantizar la estabilidad del core.

### Frontend (React + Vite)
Gestión de Estado: Uso de Zustand para un manejo ligero y eficiente de estados globales (Auth, UI Settings).

UX/UI: Soporte para Modo Oscuro/Claro y selector de idiomas.

Seguridad en el Cliente: Rutas protegidas y componentes condicionales según el rol del usuario.

Funcionalidades: CRUD completo de usuarios, gestión de perfil editable y sistema de notas dinámico.
