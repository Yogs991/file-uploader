const {body} = require("express-validator");


const validateSignUp = [
    body("email").trim().notEmpty().withMessage("Email is required").escape(),
    body("password").isLength({min: 8}).withMessage("password must contain at least 8 characters"),
    body("name").trim().notEmpty().withMessage("Name is required").escape(),
];

const validateLogin = [
    body("email").trim().notEmpty().withMessage("Email is required").isLength({max: 50}),
    body("password").trim().notEmpty().withMessage("Password is required"),
]

module.exports = {
    validateSignUp,
    validateLogin
}