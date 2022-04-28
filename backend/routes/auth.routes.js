const express = require("express");
const router = express.Router();
const authRouter = require("../controllers/auth.controller")

router.post("/api/login",authRouter.login);

module.exports = router;