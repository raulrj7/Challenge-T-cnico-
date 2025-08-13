
# Prueba Técnica - API Node.js con TypeScript y MongoDB

Este proyecto es una API REST desarrollada con Node.js, TypeScript, Express y MongoDB, diseñada para gestión de eventos, reservaciones y autenticación de usuarios.

## Levantar el proyecto con Docker

Para levantar la API y MongoDB con Docker:

docker compose up --build -d

- La API estará disponible en: http://localhost:3000
- MongoDB estará disponible en: mongodb://localhost:27017/my_database

Para comprobar que los contenedores están corriendo correctamente:

docker ps

## Estructura del proyecto


El proyecto está organizado de forma modular, con cada módulo (como autenticación, usuarios, reservas y eventos) manejando sus propias responsabilidades internamente. Esto permite mantener el código limpio, escalable y fácil de mantener, separando controladores, servicios, validadores y rutas dentro de cada módulo.


### 📌 Colección de Postman

Todos los endpoints del proyecto están disponibles en la colección de Postman que se encuentra en la carpeta postman de la raiz del proyecto.



## Correr tests

Para ejecutar los tests de la API, desde la raíz del proyecto corre:

```bash
npm run test
