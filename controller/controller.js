require("dotenv").config();
const prisma = require('../lib/prisma.js');
const bcrypt = require("bcryptjs");
const multer = require("multer");
const supabase = require("../lib/supabase.js");
// const upload = multer({dest: 'uploads/'});

const storage = multer.memoryStorage();
const uploadMulter = multer({
    storage: storage, limits: {fileSize: 1_000_000}
});

async function getMainPage(req, res){
    try {
        if(!req.user){
            return res.render("index", {user:null, folders:[]});
        }
        const folders = await prisma.folder.findMany({
        where: {
            ownerId: req.user.id,
        }
    });
    res.render("index",{user: req.user, folders: folders});
    } catch (error) {
        console.log(error);
    }
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

async function getCreateFolderForm(req,res){
    res.render("create-folder");
}

async function createFolder(req, res){
    try {
        const newFolder = await prisma.folder.create({
            data:{
                name: req.body.folderName,
                ownerId: req.user.id
            }
        })
        console.log(`${newFolder} successfully created`);
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
}

async function uploadFile(req,res){
    try {
        if(!req.user){
            res.redirect("/log-in");
        }

        if(!req.file){
            return res.status(400).send("No file uploaded");
        }

        const {folderId} = req.body;

        if(!folderId || folderId === "None"){
            return res.status(400).send("Please select a folder");
        }

        const folder = await prisma.folder.findFirst({
            where:{
                id: parseInt(folderId),
                ownerId: req.user.id
            }
        });

        if(!folder){
            return res.status(400).send("Folder not found");
        }

        const filePath = `${req.user.id}/${folder.id}/${req.file.originalname}_${Date.now()}`;

        const {data, error} =  await supabase.storage.from("uploads").upload(filePath, req.file.buffer,{
            contentType: req.file.mimetype,
            upsert: false,
        });

        
        
        if(error){
            throw error;
        }else{
            console.log("uploaded file to supabase", data);
        }

        const {data: urlData} = supabase.storage.from("uploads").getPublicUrl(filePath);
        
        await prisma.file.create({
            data:{
                title: req.file.originalname,
                link: urlData.publicUrl,
                size: req.file.size,
                uploaderId: req.user.id,
                folderId: folder.id
            }
        });

        res.redirect(`/folder/${folder.id}`);
    } catch (error) {
        console.log(error);
    }
}

async function getFolderPage(req,res){
    try {
        const folder = await prisma.folder.findFirst({
        where: {
            id: parseInt(req.params.id),
            ownerId: req.user.id,
        },
        include:{
            files: true,
        }
    });

    if(!folder){
        return res.status(404).send("Folder not found");
    }
    res.render("folder",{user: req.user, folder: folder});
    } catch (error) {
        console.log(error);
    }
}

async function downloadFile(req,res){
    try {
        const file = await prisma.file.findFirst({
            where:{
                id: parseInt(req.params.fileId),
                uploaderId: req.user.id
            }
        });

        if(!file){
            return res.status(404).send("File not found");
        }

        const urlParts = file.link.split("/uploads/");
        const filePath = urlParts[1];

        const {data,error} = await supabase.storage.from("uploads").download(filePath);

        if(error){
            throw error;
        }

        const buffer = Buffer.from(await data.arrayBuffer());
        res.setHeader("Content-Disposition", `attachment; filename=${file.title}`);
        res.setHeader("Content-Type", data.type);
        res.send(buffer);
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    uploadMulter,
    getMainPage,
    getLoginPage,
    getSignUpPage,
    saveUser,
    getUserFromDb,
    getCreateFolderForm,
    createFolder,
    uploadFile,
    getFolderPage,
    downloadFile
}