# Proyecto Plataforma Estudiantil

## Descripción

Esta es una plataforma web integral diseñada para conectar a estudiantes, tutores e instituciones. La plataforma ofrece una variedad de herramientas y funcionalidades para facilitar el aprendizaje, la orientación vocacional y la interacción entre los miembros de la comunidad educativa.

## Enfoque de la Plataforma y Funcionalidades

El objetivo principal es proporcionar un ecosistema educativo completo. Las funcionalidades clave incluyen:

*   **Dashboards Personalizados:** Vistas separadas para Estudiantes, Tutores y Administradores, cada uno con herramientas específicas para su rol.
*   **Orientación Vocacional con IA:** Utiliza modelos de IA (a través de Genkit) para ofrecer orientación vocacional y predicciones académicas.
*   **Foros y Comunidad:** Espacios para que los usuarios interactúen, hagan preguntas y compartan conocimientos.
*   **Chat en Tiempo Real:** Comunicación directa entre usuarios.
*   **Gestión de Tutores e Instituciones:** Los administradores pueden gestionar solicitudes de tutores, verificar perfiles y administrar instituciones.
*   **Sistema de Autenticación:** Registro e inicio de sesión seguros para todos los roles de usuario.
*   **Pruebas Psicológicas:** Herramientas para que los administradores creen y gestionen pruebas que los estudiantes pueden realizar.

## Guía de Instalación Local

Sigue estos pasos para instalar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

*   [Node.js](https://nodejs.org/) (versión 20 o superior)
*   [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Pasos

1.  **Clonar el Repositorio**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instalar Dependencias**

    Ejecuta el siguiente comando para instalar todas las dependencias del proyecto:

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**

    Crea un archivo llamado `.env.local` en la raíz del proyecto y agrega las credenciales de configuración de tu proyecto de Firebase. Puedes obtener estas credenciales desde la consola de Firebase en la configuración de tu proyecto.

    ```env
    # Credenciales de Firebase para el cliente
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    # (Opcional) Credenciales del Admin SDK de Firebase para el backend si es necesario
    FIREBASE_PRIVATE_KEY=...
    FIREBASE_CLIENT_EMAIL=...
    ```

4.  **Ejecutar el Servidor de Desarrollo**

    Una vez completada la instalación y configuración, puedes iniciar el servidor de desarrollo:

    ```bash
    npm run dev
    ```

    La aplicación estará disponible en [http://localhost:9002](http://localhost:9002).

## Créditos

*   **[Tu Nombre Completo]**
*   **[Tu Email de Contacto]**
*   **[URL de tu Perfil de LinkedIn o GitHub]**
