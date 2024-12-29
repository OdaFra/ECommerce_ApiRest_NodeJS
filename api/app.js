const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require("./src/helpers/jwt");
const errorHandler = require("./src/helpers/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

require("dotenv/config");

const api = process.env.API_URL;
const connectMongodb = process.env.CONNECTION_STRING;

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "Backend API for the e-commerce system",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
  },
  apis: ["./src/routers/*.js"], // Ruta a tus archivos de rutas (donde están tus comentarios Swagger)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));

// Middleware para permitir acceso a Swagger sin autenticación
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware de autenticación (lo ponemos después de Swagger)
app.use(authJwt());

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);


// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routers
const categoriesRoutes = require("./src/routers/categories");
const productsRouter = require("./src/routers/products");
const userRoutes = require("./src/routers/users");
const ordersRoutes = require("./src/routers/orders");

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/orders`, ordersRoutes);

mongoose
  .connect(connectMongodb)
  .then(() => {
    console.log("Database Connection is ready..!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(process.env.PORT || 3000, () => {
  console.log(api);
  console.log("Server is running http://localhost:3000");
});
