const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller")

router.post("/api/customer/register",customerController.register);

module.exports = router;