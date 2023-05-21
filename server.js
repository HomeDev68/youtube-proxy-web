require("dotenv").config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const ytdl = require("ytdl-core");
const ytsr = require('ytsr');
const got = require("got");

const env = process.env
var port = env.PORT || 3000
var apptitle = env.APP_TITLE || "YouTube Proxy"
var resultLimit = env.RESULT_LIMIT || 25

app.set("view engine", "ejs");
app.use(express.static('public'));
app.enable("trust proxy");


app.get("/", (req, res) => {
    res.render(path.join(__dirname, "/views/index"), {
        apptitle: apptitle
    });
});

app.get("/search", async (req, res) => {
    var query = req.query.q
    var pageNum = parseInt(req.query.p || 1)
    if(!query) return res.redirect("/");
    if(typeof pageNum !== "number") return res.status(400).send("Page is not a number")

    try {
        var searchResults = await ytsr(query, { resultLimit, pages: pageNum })
        res.render(path.join(__dirname, "/views/search"), {
            apptitle: apptitle,
            result: searchResults["items"],
            query: query,
            page: pageNum
        });
    } catch(e) {
        console.error(e);
        res.render(path.join(__dirname, "/views/error"), {
            apptitle: apptitle,
            title: "Error",
            content: e
        });
    };
});


app.get("*", (req, res) => {
    res.render(path.join(__dirname, "/views/404"), {
        apptitle: apptitle,
        title: "404",
        content: "Page Not Found"
    });
});


app.listen(port, () => {
    console.log(`[EXPRESS] Web server is now listening on port ${port}`)
});