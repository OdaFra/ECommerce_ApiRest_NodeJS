# API REST de E-Commerce con Node.js

Esta es una API RESTful para gestionar una plataforma de E-commerce, desarrollada con Node.js. La API permite gestionar **categorías**, **productos**, **pedidos**, y **usuarios**. También incluye funcionalidades para la autenticación de usuarios con medidas de seguridad como el hash de contraseñas y autenticación JWT.

## Características

- **Gestión de Usuarios**:
  - Registro de usuarios
  - Inicio de sesión con autenticación JWT
  - Gestión de contraseñas seguras
- **Gestión de Productos**:
  - Crear, actualizar, eliminar y obtener productos
- **Gestión de Pedidos**:
  - Crear, actualizar, eliminar y obtener pedidos
- **Gestión de Categorías**:
  - Añadir, actualizar, eliminar y obtener categorías
- **Seguridad**:
  - Autenticación basada en JWT
  - Contraseñas almacenadas de forma segura con bcrypt

## Requisitos Previos

- **Node.js**: Asegúrate de tener una versión compatible de Node.js instalada.
- **MongoDB**: Base de datos NoSQL para almacenar los datos de la aplicación.
- **Docker** (opcional): Para ejecutar la aplicación en contenedores.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/OdaFra/ECommerce_ApiRest_NodeJS.git
cd ECommerce_ApiRest_NodeJS
```

### 2. Configurar la api rest

Navega al directorio del api:

```bash
cd ../api
```

### 3. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en el directorio raíz y define las siguientes variables:

```env
API_URL=/api/v1
PORT=3000
CONNECTION_STRING=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/ecommerce?authSource=<usuario>
secret=tu_jwt_secreto
```

### 4. Ejecutar la aplicación

```bash
npm run start
```

#### Con Docker

1. Construir el contenedor de Docker:

```bash
  docker compose -p chatapp_mongodb up -d
```

La API estará disponible en `http://localhost:3000`.

### Sin Docker

Asegúrate de que tengas una cuenta en MongoDB con sus variables correspondientes para la conexion.

## Documentación de la API

Para acceder a la documentación desde un navegador puede ingresar a la url: `http://localhost:3000/api-docs/`

### Categorías

- **GET** `/api/v1/categories`: Obtener todas las categorías.
- **POST** `/api/v1/categories`: Crear una nueva categoría.
- **GET** `/api/v1/categories/{id}`: Obtener una categoría por ID.
- **PUT** `/api/v1/categories/{id}`: Actualizar una categoría.
- **DELETE** `/api/v1/categories/{id}`: Eliminar una categoría.

### Pedidos

- **GET** `/api/v1/orders`: Obtener todos los pedidos.
- **POST** `/api/v1/orders`: Crear un nuevo pedido.
- **GET** `/api/v1/orders/{id}`: Obtener un pedido por ID.
- **PUT** `/api/v1/orders/{id}`: Actualizar el estado de un pedido.
- **DELETE** `/api/v1/orders/{id}`: Eliminar un pedido.
- **GET** `/api/v1/orders/get/totalsales`: Obtener las ventas totales.
- **GET** `/api/v1/orders/get/count`: Obtener el número total de pedidos.
- **GET** `/api/v1/orders/get/usersorders/{userid}`: Obtener pedidos de un usuario.

### Productos

- **GET** `/api/v1/products`: Obtener todos los productos.
- **POST** `/api/v1/products`: Crear un nuevo producto.
- **GET** `/api/v1/products/{id}`: Obtener un producto por ID.
- **PUT** `/api/v1/products/{id}`: Actualizar un producto.
- **DELETE** `/api/v1/products/{id}`: Eliminar un producto.

### Usuarios

- **GET** `/api/v1/users`: Obtener todos los usuarios.
- **POST** `/api/v1/users`: Crear un nuevo usuario.
- **GET** `/api/v1/users/{id}`: Obtener un usuario por ID.
- **DELETE** `/api/v1/users/{id}`: Eliminar un usuario.
- **POST** `/api/v1/users/register`: Registrar un nuevo usuario.
- **POST** `/api/v1/users/login`: Iniciar sesión de usuario.
- **GET** `/api/v1/users/get/count`: Obtener el número total de usuarios.

## Seguridad

- Los endpoints protegidos requieren un token JWT en el encabezado `Authorization` como `Bearer <JWT_TOKEN>`.
- Las contraseñas se almacenan de forma segura utilizando bcrypt antes de ser guardadas en la base de datos.

## Pruebas con Postman

Puedes utilizar Postman para probar los endpoints de la API. Una colección de Postman está disponible [aquí](#) (reemplaza con el enlace real).

## Contacto

- **Correo electrónico**: [osramirezf@gmail.com](mailto:osramirezf@gmail.com)
- **LinkedIn**: [Perfil](https://www.linkedin.com/in/oscar-ramirez-franco/)
- **GitHub**: [Repositorio](https://github.com/OdaFra)
