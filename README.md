# ¡Bienvenido a la Plataforma Estudiantil! 🚀

## ¿Qué es esto? ¡Tu Aventura Educativa Comienza Aquí!

¡Hola! Estás viendo el corazón de una plataforma web increíble, diseñada para ser el punto de encuentro perfecto entre estudiantes, tutores e instituciones. Piensa en ella como un campus digital donde el aprendizaje, la orientación vocacional y la colaboración cobran vida con herramientas geniales y un toque de inteligencia artificial.

## Nuestro Enfoque: Un Ecosistema para Crecer Juntos

Queremos crear más que una simple web; buscamos construir un verdadero ecosistema educativo. Para lograrlo, hemos incluido funcionalidades fantásticas como:

*   **Dashboards a tu Medida:** Vistas personalizadas para Estudiantes, Tutores y Administradores. ¡Cada uno con sus propios superpoderes!
*   **Orientación Vocacional con IA:** Un consejero virtual (¡impulsado por Genkit!) que te ayudará a descubrir tu pasión y predecir tu camino académico.
*   **Foros y Comunidad:** Espacios para conectar, hacer preguntas, compartir memes educativos y aprender en equipo.
*   **Chat en Tiempo Real:** ¿Necesitas hablar con alguien? ¡Comunícate al instante con otros usuarios!
*   **Gestión de Tutores e Instituciones:** Herramientas para que los administradores puedan dar la bienvenida a nuevos tutores, verificar perfiles y gestionar las instituciones.
*   **Autenticación Segura:** Un sistema de registro e inicio de sesión para que tu cuenta esté siempre protegida.
*   **Pruebas Psicológicas:** ¡Los administradores pueden crear y gestionar tests para que los estudiantes exploren su mente y descubran sus fortalezas!

## ¡Manos a la Obra! Guía de Instalación Local

¿Listo para ejecutar el proyecto en tu propia máquina? ¡Sigue estos sencillos pasos y empecemos!

### Lo que necesitarás (tus herramientas de aventurero):

*   [Node.js](https://nodejs.org/) (versión 20 o más reciente)
*   [npm](https://www.npmjs.com/) o tu gestor de paquetes favorito, como [yarn](https://yarnpkg.com/)

### ¡Que comience la instalación!

1.  **Clona el Repositorio**

    Busca un buen lugar en tu computadora y clona este proyecto.
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instala las Dependencias**

    Es hora de darle al proyecto todo lo que necesita para funcionar. ¡Ejecuta este comando y deja que la magia suceda!
    ```bash
    npm install
    ```

3.  **Configura tus Variables de Entorno**

    Casi listo. Crea un archivo llamado `.env.local` en la raíz de tu proyecto. Aquí pegarás las credenciales de tu proyecto de Firebase. Las encontrarás en la configuración de tu proyecto en la consola de Firebase.

    ```env
    # Credenciales de Firebase para el cliente (¡son seguras para el navegador!)
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    # (Opcional) Credenciales del Admin SDK de Firebase para el backend (¡mantenlas en secreto!)
    FIREBASE_PRIVATE_KEY=...
    FIREBASE_CLIENT_EMAIL=...
    ```

4.  **¡Lanza el Servidor de Desarrollo!**

    ¡Todo listo! Con este comando, tu servidor local cobrará vida.
    ```bash
    npm run dev
    ```

    Abre tu navegador y visita [http://localhost:9002](http://localhost:9002). ¡Bienvenido a tu propia versión de la plataforma!

## Los Héroes Detrás del Código (¡Créditos!)

Este proyecto fue creado con mucho cariño y código por:

*   **[Tu Nombre Completo]**
*   **[Tu Email de Contacto]**
*   **[URL de tu Perfil de LinkedIn o GitHub]**

¡Gracias por ser parte de esta aventura! Si tienes alguna idea o sugerencia, no dudes en compartirla. 😊