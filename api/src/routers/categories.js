const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: "Get all categories"
 *     description: "Returns a list of all categories"
 *     responses:
 *       200:
 *         description: "A list of categories"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   color:
 *                     type: string
 */
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: "Get category by ID"
 *     description: "Returns a single category based on the given ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "The category ID"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "The category"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 icon:
 *                   type: string
 *                 color:
 *                   type: string
 *       500:
 *         description: "Category not found"
 */
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(500).json({
      message: "The category with the given ID was not found!!",
    });
  }
  return res.status(200).send(category);
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: "Update category"
 *     description: "Updates an existing category with the provided data"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "The category ID"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Category updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 icon:
 *                   type: string
 *                 color:
 *                   type: string
 *       400:
 *         description: "Failed to update category"
 */
router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    },
    { new: true }
  );

  if (!category) return res.status(400).send("The category cannot be updated!");

  res.send(category);
});

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: "Create a new category"
 *     description: "Adds a new category to the catalog"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Category created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 icon:
 *                   type: string
 *                 color:
 *                   type: string
 *       400:
 *         description: "Failed to create category"
 */
router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) return res.status(400).send("The category cannot be created!");

  res.send(category);
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: "Delete a category"
 *     description: "Deletes a category based on the provided ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "The category ID"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Category deleted successfully"
 *       404:
 *         description: "Category not found"
 */
router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: "The category has been deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Category not found!",
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
