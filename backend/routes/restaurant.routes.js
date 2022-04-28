const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller")

router.post("/api/restaurant/register",restaurantController.register);
router.post("/api/restaurant/add_item",restaurantController.add_item);
router.post("/api/restaurant/update_details",restaurantController.update_details);
router.post("/api/restaurant/update_food_item",restaurantController.update_food_item);
router.post("/api/restaurant/delete_food_item",restaurantController.delete_food_item);

module.exports = router;