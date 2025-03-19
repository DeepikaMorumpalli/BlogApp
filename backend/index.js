const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.js');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest: 'uploads/'});
const fs = require('fs');
const Post = require('./models/Post.js');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const salt = bcrypt.genSaltSync(10);
const secret = 'ndjoqu3nkfjofgg';

app.use(cors({credentials: true, origin:process.env.CORS_URL}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URL);

app.post('/register', async(req,res)=>{
    const {username, password} =req.body;
    try{
        const newUser = await User.create({
            username, 
            password: bcrypt.hashSync(password, salt),
        });
        res.json(newUser);
    } catch(e){
        res.status(400).json(e);
    }
});

app.post('/login', async (req,res)=>{
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk){
        const token = jwt.sign({username, id:userDoc._id}, secret);
        res.cookie('token', token).json({
            id: userDoc._id,
            username,
        });
    }else{
        res.status(400).json('wrong credentials');
    }
})

app.get('/profile', (req,res)=>{
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info)=>{
        res.json(info);
    })
})

app.post('/logout', (req,res)=>{
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async(req,res)=>{
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length-1];
    const newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async(err,info)=>{
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        res.json(postDoc);
    })
})

app.put('/post', uploadMiddleware.single('file'), async(req,res)=>{
    let newPath = null;
    if(req.file){
        const {originalname, path} = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length-1];
        const newPath = path+'.'+ext;
        fs.renameSync(path, newPath);
    }
    
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async(err,info)=>{
        if(err) throw err;
        const {id,title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author)===JSON.stringify(info.id);
        if(!isAuthor){
            return res.status(400).json('you are not the author');
        }
        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        postDoc.cover = newPath ? newPath : postDoc.cover;

        await postDoc.save();

        res.json(postDoc);
    })
})

app.get('/post', async (req,res)=>{
    res.json(await Post.find()
                .populate('author', ['username'])
                .sort({createdAt: -1})
                .limit(20)
    );
})

app.get('/post/:id', async(req,res)=>{
    const {id} = req.params;
    const postDoc = await Post.findById(id)
                    .populate('author', ['username']);
    res.json(postDoc);
})

app.listen(4000, ()=>{
    console.log("app is listening");
})