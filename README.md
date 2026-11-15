# Parkly | Sistema de estacionamiento

Sistema administrativo web con React, Bootstrap, Node.js, Express y PostgreSQL. Incluye gestión de usuarios, clientes y convenios, vehículos, espacios, entradas/salidas, caja y reportes PDF.

## Requisitos

- Node.js 20.19+ o 22.12+
- PostgreSQL 14+

## Instalación

1. Crea una base de datos en PostgreSQL llamada `estacionamiento`.
2. Copia `server/.env.example` a `server/.env` y configura `DATABASE_URL` con tu usuario y contraseña de PostgreSQL.
3. Instala las dependencias desde la raíz y las del servidor:

```powershell
npm install
npm install --prefix server
```

4. Crea las tablas y carga registros iniciales:

```powershell
npm run server:setup
```

5. Inicia el servidor API y Vite en dos terminales:

```powershell
npm run server
npm run dev
```

Abre la URL que muestra Vite, normalmente `http://localhost:5173`. Vite reenvía `/api` al servidor local en el puerto `3000`.

La tarifa se configura en `server/.env` con `PARKING_RATE_PER_HOUR`; la salida cobra cada hora o fracción. El pago QR es una simulación, no procesa transacciones bancarias.

## Imágenes

- Auto: `modelo_auto.jpg`, imagen incluida en el proyecto de referencia compartido.
- Moto: foto de Unsplash `photo-1558981806-ec527fa84c39`, bajo la licencia de [Unsplash](https://unsplash.com/license).
- Camioneta: foto de Livingstone Imonitie, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Black_pickup_truck_in_birnin_kebbi.jpg), licencia [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## PostgreSQL para copiar y pegar

Primero crea la base de datos. En pgAdmin puedes ejecutar este bloque conectado a la base `postgres`:

```sql
CREATE DATABASE estacionamiento;
```

Después selecciona la base `estacionamiento`, abre **Query Tool** y copia/ejecuta el contenido completo de [`server/sql/instalacion_postgres.sql`](server/sql/instalacion_postgres.sql). El archivo incluye tablas, relaciones, índices, imágenes de vehículos y registros iniciales. También puedes ejecutarlo desde PowerShell con `psql`:

```powershell
psql -U postgres -d estacionamiento -f server/sql/instalacion_postgres.sql
```

Para el servidor Node, configura `DATABASE_URL` en `server/.env` y ejecuta `npm run server`.

## Arquitectura

```text
src/
	components/       Componentes compartidos, navegación y formularios
	data/             Datos de demostración cuando la API no está disponible
	modulos/
		clientes/       index, create y edit
		operaciones/    Entradas, salidas y tickets
		espacios/       index, create y edit
		usuarios/       index, create y edit
		vehiculos/      index, create y edit
		caja/           Historial de cobros
		inicio/         Resumen y ocupación
		reportes/       Exportación PDF
	services/         Cliente HTTP de la API
server/
	src/config/       Conexión PostgreSQL
	src/controllers/  Consultas y reglas de negocio por módulo
	src/routes/       Endpoints REST
	sql/              Esquema, relaciones, índices y datos iniciales
```

Los registros se conservan: usuarios, clientes, vehículos y espacios se activan o desactivan sin borrarlos. Las entradas y salidas usan transacciones para mantener sincronizados tickets, espacios y pagos. La gestión de usuarios es un catálogo administrativo básico; no incluye autenticación ni contraseñas.

## Endpoints principales

- `GET /api/dashboard`
- `GET, POST /api/users`, `PUT /api/users/:id`, `PATCH /api/users/:id/status`
- `GET, POST /api/clients`, `PUT /api/clients/:id`, `PATCH /api/clients/:id/status`
- `GET, POST /api/vehicles`, `PUT /api/vehicles/:id`, `PATCH /api/vehicles/:id/status`
- `GET, POST /api/spaces`, `PUT /api/spaces/:id`, `PATCH /api/spaces/:id/status`
- `POST /api/operations/entry`, `POST /api/operations/exit/:ticket`
- `GET, POST /api/cash`

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
