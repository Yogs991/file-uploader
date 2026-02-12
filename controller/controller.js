require("dotenv").config();
const prisma = require('../lib/prisma.js');
const bcrypt = require("bcryptjs");

async function getMainPage(req, res){
    res.render("index");
}

async function getLoginPage(req, res){
    res.render("log-in");
}

async function getSignUpPage(req, res){
    res.render("sign-up");
}

module.exports = {
    getMainPage,
    getLoginPage,
    getSignUpPage
}