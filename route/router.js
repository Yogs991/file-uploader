const express = require("express");
const {Router} = require("express");
const router = express.Router();
const controller = require("../controller/controller");
const passport = require("passport");

router.get("/", controller.getMainPage);

router.get("/log-in", controller.getLoginPage);

router.get("/sign-up", controller.getSignUpPage);

router.get("/create-folder",controller.getCreateFolderForm)

router.post("/log-in",passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/log-in"
    }
));

router.post("/sign-up", controller.saveUser);

router.post("/log-out", (req, res, next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/");
    })
});

router.post("/create-folder", controller.createFolder);

router.post("/upload", controller.uploadMulter.single('file') ,controller.uploadFile);


module.exports = router;