const express = require("express");
const router = express.Router();
const dummyController = require("../controllers/dummy.controller")

router.get("/api/dummy",dummyController.dummy);

module.exports = router;