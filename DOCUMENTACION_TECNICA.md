# Documentación Técnica: Sistema de Asistencia Biométrica

## 1. Visión General
Este proyecto es una aplicación web de una sola página (SPA) desarrollada con **Vue 3** y el framework **Quasar**. Su función principal es gestionar la asistencia de personal mediante **reconocimiento facial** en tiempo real, operando completamente en el lado del cliente (navegador) sin necesidad de un backend complejo para el procesamiento de imágenes.

## 2. Tecnologías Principales
*   **Vue.js 3 (Composition API)**: Framework reactivo para la interfaz de usuario.
*   **Quasar Framework**: Biblioteca de componentes UI (Material Design) y gestión de layout.
*   **face-api.js**: Biblioteca de JavaScript construida sobre TensorFlow.js para la detección y reconocimiento facial en el navegador.
*   **LocalStorage**: Sistema de almacenamiento persistente en el navegador para guardar usuarios y registros.

## 3. Arquitectura del Proyecto

### Estructura de Carpetas
*   `/src/layouts/MainLayout.vue`: Estructura base (Menú lateral, encabezado).
*   `/src/pages/AttendancePage.vue`: Página principal de escaneo para tomar asistencia.
*   `/src/pages/RegisterPage.vue`: Página administrativa para registrar nuevos rostros.
*   `/src/pages/LogsPage.vue`: Página de reporte para ver el historial de entradas.
*   `/src/services/StorageService.js`: Capa de lógica de datos y algoritmos de comparación facial.

## 4. Funcionamiento Detallado

### A. Carga de Modelos de Inteligencia Artificial
Antes de que la cámara se active, el sistema descarga modelos pre-entrenados desde una CDN (GitHub de face-api).
*   **ssdMobilenetv1**: Detecta dónde hay una cara en la imagen.
*   **faceLandmark68Net**: Detecta los 68 puntos clave del rostro (ojos, nariz, boca).
*   **faceRecognitionNet**: Convierte la cara en un vector numérico único (Descriptor).

### B. Módulo de Registro (`RegisterPage.vue`)
1.  **Captura**: El usuario ingresa Nombre e ID y activa la cámara.
2.  **Detección**: Al pulsar "Capturar", `face-api.js` analiza el frame actual del video.
3.  **Generación del Descriptor**: Si se detecta una cara, se genera un **Descriptor Facial**.
    *   *¿Qué es un Descriptor?*: Es un array de 128 números decimales que representan matemáticamente las características únicas del rostro. No se guarda la foto, solo estos números.
4.  **Almacenamiento**: Este descriptor, junto con el Nombre e ID, se guarda en el `localStorage` del navegador bajo la clave `attendance_users`.

### C. Módulo de Asistencia (`AttendancePage.vue`)
1.  **Streaming**: Se accede a la webcam de nuevo utilizando `navigator.mediaDevices.getUserMedia`.
2.  **Bucle de Detección**: Un intervalo (cada 500ms) ejecuta el proceso de detección silenciosamente.
3.  **Comparación Biométrica (Matching)**:
    *   Cada vez que la cámara detecta una cara, genera su descriptor temporal (128 números).
    *   Este descriptor se envía al `StorageService`.
    *   **Algoritmo de Distancia Euclidiana**: El servicio compara el descriptor actual con TODOS los descriptores guardados en memoria.
    *   Calcula la "distancia" matemática entre ellos. Si la distancia es menor a **0.6** (umbral de similitud), se considera que es la misma persona.
4.  **Registro**: Si hay coincidencia, se guarda un log con fecha y hora en `localStorage` (`attendance_logs`) y se notifica al usuario.

### D. Servicio de Datos (`StorageService.js`)
Actúa como una base de datos local y motor de búsqueda.
*   `findUserByFace(descriptor)`: Recorre todos los usuarios y busca el que tenga la menor distancia matemática con el rostro actual.
*   `getLogs()` / `saveLog()`: Gestiona el historial de entradas/salidas.

## 5. Guía para el Desarrollador

### Cómo extender el proyecto
*   **Persistencia Real**: Actualmente usa `localStorage`, que se borra si el usuario limpia el navegador. Para producción, edita `StorageService.js` para que haga peticiones HTTP (Axios/Fetch) a una base de datos real (MySQL/MongoDB).
*   **Ajuste de Sensibilidad**: En `StorageService.js`, la variable `minDistance = 0.6` controla qué tan estricto es el reconocimiento.
    *   Bajar a `0.4` = Más estricto (menos falsos positivos, pero puede fallar si la luz cambia).
    *   Subir a `0.7` = Más permisivo (reconoce más fácil, pero riesgo de confundir personas).

### Diseño Responsivo
El sistema utiliza clases de Quasar (`col-12`, `col-md-4`) y CSS personalizado (Media Queries) para adaptar el tamaño del video y los calendarios a pantallas de móviles (min 300px width), asegurando que la cámara siempre sea visible sin deformarse (`aspect-ratio`).

---
*Generado automáticamente por Antigravity AI*
