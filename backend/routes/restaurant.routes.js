const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller")
const auth = require('../models/auth')

router.post("/register",restaurantController.register);
router.post("/add_item", auth.authenticateToken, restaurantController.add_item);
router.post("/update_details",auth.authenticateToken,restaurantController.update_details);
router.post("/update_food_item",auth.authenticateToken,restaurantController.update_food_item);
router.post("/delete_food_item",auth.authenticateToken,restaurantController.delete_food_item);
router.get("/food_item_list",auth.authenticateToken,restaurantController.food_item_list)
router.get("/profile",auth.authenticateToken,restaurantController.profile);
router.get("/orders",auth.authenticateToken,restaurantController.orders);
router.get("/orders/free",auth.authenticateToken,restaurantController.freeOrders);
router.get("/order/accept",auth.authenticateToken,restaurantController.acceptOrder);

module.exports = router;