# MVP - Lista de Supermercado Compartida (Backend)

API REST con TypeScript, Node.js, Express y PostgreSQL, usando arquitectura por capas (`routes`, `controllers`, `services`) y acceso a BD con `pg` (sin ORM).

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Configuración

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea el archivo `.env`:
   ```bash
   cp .env.example .env
   ```
3. Ajusta variables en `.env`:
   - `PORT`
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Crea las tablas:
   ```bash
   psql "$DATABASE_URL" -f db.sql
   ```

## Ejecución

- Desarrollo:
  ```bash
  npm run dev
  ```
- Build:
  ```bash
  npm run build
  ```
- Producción:
  ```bash
  npm start
  ```

## Endpoints

### Auth
- `POST /auth/register`
  - body: `{ "email": "user@mail.com", "password": "123456" }`
- `POST /auth/login`
  - body: `{ "email": "user@mail.com", "password": "123456" }`
  - respuesta: `{ "token": "..." }`

### Productos (requiere `Authorization: Bearer <token>`)
- `GET /products` lista todos los productos
- `POST /products` crea producto
  - body: `{ "nombre": "Leche" }`
- `PATCH /products/:id/toggle` cambia `completado`
- `DELETE /products/:id` elimina producto

## Reglas implementadas

- Registro y login con JWT.
- Passwords hasheados con bcrypt.
- Lista compartida entre usuarios.
- Solo usuarios autenticados pueden modificar o listar productos.
- Validación de nombre vacío.
- Validación de productos duplicados exactos.
- Restricción de edición de 20 segundos desde `updated_at`:
  - Si se intenta editar antes, devuelve `403` con:
    `Debes esperar X segundos antes de editar este producto`.
  - Al editar, se actualiza `updated_at` y se reinicia el contador.
