const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller")
const auth = require('../models/auth')

router.post("/register",restaurantController.register);
router.post("/add-item", auth.authenticateToken, restaurantController.add_item);
router.post("/update-details",auth.authenticateToken,restaurantController.update_details);
router.post("/update-food-item",auth.authenticateToken,restaurantController.update_food_item);
router.post("/delete-food-item",auth.authenticateToken,restaurantController.delete_food_item);
router.get("/food-item-list",auth.authenticateToken,restaurantController.food_item_list)
router.get("/profile",auth.authenticateToken,restaurantController.profile);
router.get("/orders",auth.authenticateToken,restaurantController.orders);

module.exports = router;