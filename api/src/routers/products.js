const express = require("express");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

// Validation extension
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

// Add image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: "Get all products"
 *     description: "Retrieve a list of all products, with optional category filtering"
 *     parameters:
 *       - in: query
 *         name: categories
 *         required: false
 *         description: "Comma separated list of category IDs to filter products by"
 *         schema:
 *           type: string
 *           example: "60adf6a2e3b5a04b9c3d82d1"
 *     responses:
 *       200:
 *         description: "List of products"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: "Failed to fetch products"
 */
router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: "Get product by ID"
 *     description: "Retrieve product details by ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "Product ID"
 *         schema:
 *           type: string
 *           example: "60adf6a2e3b5a04b9c3d82d1"
 *     responses:
 *       200:
 *         description: "Product found"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       500:
 *         description: "Product not found"
 */
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: "Create a new product"
 *     description: "Create a new product and upload an image"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               richDescription:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               brand:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               countInStock:
 *                 type: number
 *               rating:
 *                 type: number
 *               numReviews:
 *                 type: number
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: "Product created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: "Invalid category or no image provided"
 */
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  var product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");

  res.send(product);
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: "Update a product"
 *     description: "Update a product's details including the image"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "Product ID"
 *         schema:
 *           type: string
 *           example: "60adf6a2e3b5a04b9c3d82d1"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               richDescription:
 *                 type: string
 *               image:
 *                 type: string
 *               brand:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               countInStock:
 *                 type: number
 *               rating:
 *                 type: number
 *               numReviews:
 *                 type: number
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: "Product updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: "Invalid product ID or category"
 *       500:
 *         description: "Failed to update product"
 */
router.put(`/:id`, uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }

  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Invalid Product");

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updateProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagepath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!updateProduct)
    return res.status(500).send("The product cannot be update!");

  res.send(updateProduct);
});

// Delete a product
/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: "Delete a product"
 *     description: "Delete a product by ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "Product ID"
 *         schema:
 *           type: string
 *           example: "60adf6a2e3b5a04b9c3d82d1"
 *     responses:
 *       200:
 *         description: "Product deleted successfully"
 *       404:
 *         description: "Product not found"
 */
router.delete(`/:id`, (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "The product is deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

module.exports = router;
