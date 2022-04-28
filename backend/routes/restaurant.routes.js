const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller")
const auth = require('../models/auth')

router.post("/api/restaurant/register",restaurantController.register);
router.post("/api/restaurant/add_item", auth.authenticateToken, restaurantController.add_item);
router.post("/api/restaurant/update_details",auth.authenticateToken,restaurantController.update_details);
router.post("/api/restaurant/update_food_item",auth.authenticateToken,restaurantController.update_food_item);
router.post("/api/restaurant/delete_food_item",auth.authenticateToken,restaurantController.delete_food_item);

module.exports = router;