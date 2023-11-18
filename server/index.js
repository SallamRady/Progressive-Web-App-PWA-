const express = require('express');
const path = require("path");
const cors = require('cors');
const webPush = require("web-push");
const posts = [
    {
        id: 0,
        title: "Cairo Trip",
        location: "In Cairo, Egypt.",
        image: "/src/images/cairo.jpg"
    },
    {
        id: 1,
        title: "Alex Trip",
        location: "In Alex, Egypt.",
        image: "/src/images/alex.jpeg"
    },
    {
        id: 2,
        title: "Luxor Trip",
        location: "In Luxor, Egypt.",
        image: "/src/images/Luxor.jpg"
    },
    {
        id: 3,
        title: "London Trip",
        location: "In London, England.",
        image: "/src/images/London.jpg"
    },
    {
        id: 4,
        title: "Paris Trip",
        location: "In Paris, France.",
        image: "/src/images/Paris.jpg"
    },
    {
        id: 5,
        title: "HongKong Trip",
        location: "In HongKong, China.",
        image: "/src/images/HongKong.jpg"
    }
];
const Subscriptions = [];

const app = express();
app.use(cors());
// Destination folder for uploaded images
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(path.join(__dirname, "images")));

//Helper middleware to add general setting
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "");
    next();
});

// GET /posts - Get all posts
app.get('/posts', (req, res, next) => {
    return res.status(200).json(posts);
});

// POST /create/post - post created successfully.
app.post('/create/post', (req, res, next) => {
    // declaration...
    let newPost = req.body;
    let privateKey = `F_bSpsJnojel-8L8SEtASpK0JHVpWTDBNa42nv94aOU`;
    let publicKey = `BN9LQCggbHNq7a1nSAv2UCVQ5xF9oc2IBrRVL1pqpIdYdDI-pOd0kICULtcvs2ws2N4BHFuOdSHpeqidK2N56qY`;
    let subject = 'mailto:sallamrady99@gmail.com';
    posts.push(newPost)
    webPush.setVapidDetails(subject, publicKey, privateKey);
    for (let i = 0; i < Subscriptions.length; i++) {
        const element = Subscriptions[i];
        let msgBody = JSON.stringify({ title: "New Post", content: "New Post Added!" })
        webPush.sendNotification(element, msgBody);
    }
    return res.status(201).json({
        msg: "post created successfully."
    });
});

// POST /create/subscription - subscription created successfully.
app.post('/create/subscription', (req, res, next) => {
    // console.log("Data:", req.body);
    Subscriptions.push(req.body);
    console.log("Subscription ", req.body);
    return res.status(200).json({
        msg: "Subscription created successfully."
    });
});

//error middleware
app.use((error, req, res, next) => {
    console.log("Error :", error);
    let status = error.statusCode || 500;
    let message = error.message;
    return res.status(status).json({ message: message, error: error });
});


// Start the server
app.listen(9000, () => {
    console.log('Server started on port 9000');
});