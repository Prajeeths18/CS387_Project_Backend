const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/delivery.controller")
const auth = require("../models/auth")

router.post("/register",deliveryController.register);
router.post("/update",auth.authenticateToken,deliveryController.update);
router.post("/availability",auth.authenticateToken,deliveryController.availability)

module.exports = router;