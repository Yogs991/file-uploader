const express = require("express");
const {Router} = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const passport = require("passport");

router.get("/", controller.getMainPage);
router.get("/log-in", controller.getLoginPage);
router.get("/sign-up", controller.getSignUpPage);

// router.post("/log-in");
// router.post("/sign-up");


module.exports = router;