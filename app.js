require('dotenv').config();
const path = require('node:path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {PrismaSessionStore} = require('@quixo3/prisma-session-store');
const bcrypt = require('bcryptjs');
const prisma = require('./lib/prisma.js');
const router = require("./route/router");

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

const passportStrategy = new LocalStrategy(async(email, password, done)=>{
    try{
        const user =  await prisma.user.findUnique(
            {where: {email}},
        )

        if(!user){
            return done(null, false, {message: "Incorrect email"});
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match){
            return done(null, false, {message: "Incorrect password"});
        }

        return done(null,user);
    }catch(err){
        console.error(err);        
    }
});

passport.serializeUser((user, done)=>{
    done(null, user.id);
});

passport.deserializeUser(async(id, done)=>{
    try {
       const user = await prisma.user.findUnique({where: {id}});
       done(null,user);
    }catch(err){
        console.log(err);            
    }
});

passport.use(passportStrategy);

app.use(
    session({
        secret: process.env.SECRET_SESSION,
        resave: true,
        saveUninitialized: true,
        cookie:{
            maxAge: 7 * 24 * 60 * 60 * 1000
        },
        store: new PrismaSessionStore(prisma,{
            checkPeriod: 2 * 60 * 1000,
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    }),
);

app.use(passport.session());

app.use("/", router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error)=>{
    if(error){
        console.log(error);
    }
    console.log(`app listening on port ${PORT}`);
})


