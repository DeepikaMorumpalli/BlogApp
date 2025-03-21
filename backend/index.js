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
const {upload} = require("./cloudinaryConfig");

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;

mongoose.connect(process.env.MONGO_URL);

app.use(cors({credentials: true, origin:process.env.CORS_URL}));
app.use(express.json());
app.use(cookieParser());

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

app.post("/post", upload.single("file"), async (req, res) => {
    try {
      const { title, summary, content } = req.body;
      const { token } = req.cookies;
      jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        const coverUrl = req.file ? req.file.path : null; 
        const postDoc = await Post.create({
          title,
          summary,
          content,
          cover: coverUrl, 
          author: info.id,
        });
        res.json(postDoc);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.put("/post", upload.single("file"), async (req, res) => {
    try {
      let newCoverUrl = null;
      if (req.file) {
        newCoverUrl = req.file.path; 
      }
      const { token } = req.cookies;
      jwt.verify(token, secret, {}, async (err, info) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        if (!postDoc) return res.status(404).json({ error: "Post not found" });
        if (JSON.stringify(postDoc.author) !== JSON.stringify(info.id)) {
          return res.status(403).json({ error: "You are not the author" });
        }
        postDoc.title = title;
        postDoc.summary = summary;
        postDoc.content = content;
        if (newCoverUrl) postDoc.cover = newCoverUrl; 
        await postDoc.save();
        res.json(postDoc);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
})

app.get('/post', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20);

        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            summary: post.summary,
            content: post.content,
            cover: post.cover, 
            author: post.author,
            createdAt: post.createdAt
        }));
        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/post/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const postDoc = await Post.findById(id).populate("author", ["username"]);
      if (!postDoc) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(postDoc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });  

app.listen(4000, ()=>{
    console.log("app is listening");
})