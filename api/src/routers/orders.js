const { Order } = require("../models/order");
const { OrderItems } = require("../models/order-item");

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: "Get all orders"
 *     description: "Returns a list of all orders"
 *     responses:
 *       200:
 *         description: "A list of orders"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   status:
 *                     type: string
 *                   totalPrice:
 *                     type: number
 *                   dateOrdered:
 *                     type: string
 */
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: "Get order by ID"
 *     description: "Returns a single order based on the given ID"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "The order ID"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "The order"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 totalPrice:
 *                   type: number
 *                 dateOrdered:
 *                   type: string
 *       500:
 *         description: "Order not found"
 */
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: "Create a new order"
 *     description: "Creates a new order with the provided order items and details"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress1:
 *                 type: string
 *               shippingAddress2:
 *                 type: string
 *               city:
 *                 type: string
 *               zip:
 *                 type: string
 *               country:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       201:
 *         description: "Order created successfully"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 totalPrice:
 *                   type: number
 *                 dateOrdered:
 *                   type: string
 *       400:
 *         description: "Failed to create order"
 *       500:
 *         description: "Internal server error"
 */
router.post("/", async (req, res) => {
  try {
    const orderItemIdsResolved = await Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItems({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    if (orderItemIdsResolved.length === 0) {
      return res.status(400).send("No order items provided!");
    }

    const totalPrices = await Promise.all(
      orderItemIdsResolved.map(async (orderItemId) => {
        try {
          const orderItem = await OrderItems.findById(orderItemId).populate(
            "product",
            "price"
          );

          if (!orderItem) {
            throw new Error("Order item not found!");
          }
          const totalPrice = orderItem.product.price * orderItem.quantity;
          return totalPrice;
        } catch (error) {
          console.error("Error calculating totalPrice:", error.message);
          throw error;
        }
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
      orderItems: orderItemIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });

    order = await order.save();

    if (!order) {
      return res.status(400).send("The order cannot be created!");
    }

    res.send(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     summary: "Update order status"
 *     description: "Updates the status of an existing order"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "The order ID"
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Order updated successfully"
 *       400:
 *         description: "Failed to update order"
 */
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) return res.status(400).send("The order cannot be updated!");

  res.send(order);
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: "Delete an order"
 *     description: "Deletes an order and its associated order items"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "The order ID"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "Order deleted successfully"
 *       404:
 *         description: "Order not found"
 */
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await Promise.all(
          order.orderItems.map(async (orderItem) => {
            await OrderItems.findByIdAndRemove(orderItem._id);
          })
        );

        return res.status(200).json({
          success: true,
          message: "The order has been deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Order not found!",
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

/**
 * @swagger
 * /api/v1/orders/get/totalsales:
 *   get:
 *     summary: "Get total sales"
 *     description: "Returns the total sales amount for all orders"
 *     responses:
 *       200:
 *         description: "Total sales amount"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSales:
 *                   type: number
 *       400:
 *         description: "Unable to calculate total sales"
 */
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }
  res.send({
    totalSales: totalSales.pop().totalSales,
  });
});

/**
 * @swagger
 * /api/v1/orders/get/count:
 *   get:
 *     summary: "Get total order count"
 *     description: "Returns the total number of orders"
 *     responses:
 *       200:
 *         description: "Total number of orders"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderCount:
 *                   type: number
 *       500:
 *         description: "Failed to count orders"
 */
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments({});
  if (!orderCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({ orderCount: orderCount });
});

/**
 * @swagger
 * /api/v1/orders/get/usersorders/{userid}:
 *   get:
 *     summary: "Get orders by user"
 *     description: "Returns a list of orders placed by a specific user"
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         description: "User ID"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "A list of orders"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: "User orders not found"
 */
router.get(`/get/usersorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = router;
