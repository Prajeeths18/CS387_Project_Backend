const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller")
const auth = require("../models/auth")

router.post("/register",customerController.register);
router.post("/update",auth.authenticateToken,customerController.update);
router.post("/address/add",auth.authenticateToken,customerController.add_address);
router.post("/address/delete",auth.authenticateToken,customerController.delete_address);
router.post("/address/update",auth.authenticateToken,customerController.update_address);
router.post("/order",auth.authenticateToken,customerController.order);
router.post("/review/restaurant",auth.authenticateToken,customerController.restaurant_review);
router.post("/review/food",auth.authenticateToken,customerController.food_review);
router.post("/review/delivery",auth.authenticateToken,customerController.delivery_review);
router.get("/restaurant_list",auth.authenticateToken,customerController.restaurant_list);
router.get("/profile",auth.authenticateToken,customerController.profile);
router.get("/orders",auth.authenticateToken,customerController.orders);

module.exports = router;