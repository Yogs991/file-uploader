require("dotenv").config();
const prisma = require('../lib/prisma.js');
const bcrypt = require("bcryptjs");
const multer = require("multer");
const upload = multer({dest: 'uploads/'});

async function getMainPage(req, res){
    res.render("index",{user: req.user});
}

async function getLoginPage(req, res){
    res.render("log-in", {user: req.user});
}

async function getSignUpPage(req, res){
    res.render("sign-up");
}

async function saveUser(req, res){
    const {email, name, password}= req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    try{
        await prisma.user.create({
            data:{
                email: email,
                password: hashedPassword,
                name: name
            }
        })
        console.log("User succesfully created");
        res.redirect("/log-in");
    }catch(err){
        console.log(err);        
    }
}

async function getUserFromDb(req,res){
    const email = req.body.email;
    try{
        await prisma.user.findUnique({
            where: {email:email}
        });
        console.log("User logged in successfully");
        res.render("index", {user: req.user});
    }catch(err){
        console.log(err);
    }
}

module.exports = {
    getMainPage,
    getLoginPage,
    getSignUpPage,
    saveUser,
    getUserFromDb
}