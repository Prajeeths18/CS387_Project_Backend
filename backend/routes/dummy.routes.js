const express = require("express");
const router = express.Router();
const dummyController = require("../controllers/dummy.controller")
const auth = require('../models/auth');

router.get("/api/dummy",auth.authenticateToken,dummyController.dummy);

module.exports = router;