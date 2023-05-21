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
var useragent = env.USER_AGENT || "googlebot"

app.set("view engine", "ejs");
app.use(express.static('public'));
app.enable("trust proxy");

app.use(function (req, res, next) {
    res.setHeader('X-Content-Type-Options', "nosniff");
    next();
  });

app.get("/", (req, res) => {
    res.render(path.join(__dirname, "/views/index"), {
        apptitle: apptitle
    });
});

app.get("/search", async (req, res) => {
    var query = req.query.q
    var pageNum = parseInt(req.query.p || 1)
    if(!query) return res.redirect("/");

    if(typeof pageNum !== "number") {
        console.log("The type of the pageNum variable is being detected as a string, not a number.");
        res.status(400).render("error.ejs", {
            apptitle: apptitle,
            title: "400 - Bad Request",
            content: `The param is being detected as a string, not a number.`,
        });
    };

    try {
        var searchResult = await ytsr(query, { resultLimit, pages: pageNum })
        res.status(200).render(path.join(__dirname, "/views/search"), {
            apptitle: apptitle,
            result: searchResult["items"],
            resultNum: searchResult["results"],
            query: query,
            page: pageNum
        });
    } catch(e) {
        console.error(e);
        res.status(400).render(path.join(__dirname, "/views/error"), {
            apptitle: apptitle,
            title: "Error",
            content: e
        });
    };

});

app.get(["/vi*", "/sb/*"], async (req, res) => {
    var url = "https://i.ytimg.com" + req.url
    var options = { headers: { "User-Agent": useragent }, isStream: true, maxRedirects: 2 };

    try {
        var request = await got.get(url, options)
        request.pipe(res);
        //res.status(200).send("OK")
    } catch(e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error", error: e})
    }

});

app.get(["/yt3/*", "/ytc/*"], async (req, res) => {
    if (req.url.startsWith("/yt3/")) req.url = req.url.slice(4);
    var url = "https://yt3.ggpht.com" + req.url
    var options = { headers: { "User-Agent": useragent }, isStream: true, maxRedirects: 2 };

    try {
        var request = await got.get(url, options)
        request.pipe(res);
        //res.status(200).send("OK")
        } catch(e) {
        console.error(e);
        return res.status(500).json({ message: "Internal Server Error", error: e});
    }

});


app.use((req, res) => {
    res.status(404).render("error.ejs", {
        apptitle: apptitle,
        title: "404 - Not Found",
        content: "Page Not Found",
    });
});


app.listen(port, () => {
    console.log(`[EXPRESS] Web server is now listening on port ${port}`)
});