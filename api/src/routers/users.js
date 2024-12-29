const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users excluding password hashes.
 *     responses:
 *       200:
 *         description: A list of users excluding password hashes
 *       500:
 *         description: Server error
 */
router.get(`/`, async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");
    res.status(200).send(userList);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieve a user by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *       500:
 *         description: User not found
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// /**
//  * @swagger
//  * /api/v1/users:
//  *   post:
//  *     summary: Create a new user
//  *     description: Register a new user with the provided details.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               isAdmin:
//  *                 type: boolean
//  *               apartment:
//  *                 type: string
//  *               zip:
//  *                 type: string
//  *               city:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: User created successfully
//  *       400:
//  *         description: Invalid input or email already in use
//  */
// router.post("/", async (req, res) => {
//   try {
//     const existingUser = await User.findOne({ email: req.body.email });
//     if (existingUser) {
//       return res.status(400).send("The email is already in use!");
//     }

//     const user = new User({
//       name: req.body.name,
//       email: req.body.email,
//       passwordHash: bcrypt.hashSync(req.body.password, 10),
//       phone: req.body.phone,
//       isAdmin: req.body.isAdmin,
//       apartment: req.body.apartment,
//       zip: req.body.zip,
//       city: req.body.city,
//       country: req.body.country,
//     });

//     await user.save();
//     res.status(201).send(user);
//   } catch (error) {
//     res.status(400).send("The user cannot be created!");
//   }
// });


/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *               apartment:
 *                 type: string
 *               zip:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or email already in use
 */
router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send("The email is already in use!");
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send("The user cannot be created!");
  }
});

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and generates a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).send("User not found!");
    }

    if (bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        process.env.secret,
        { expiresIn: "1d" }
      );

      res.status(200).send({
        message: "User Authenticated",
        user: user.email,
        token,
      });
    } else {
      res.status(400).send("Incorrect password!");
    }
  } catch (error) {
    res.status(500).send("Server error");
  }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Deletes a user by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error });
  }
});

module.exports = router;
