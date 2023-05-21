require("dotenv").config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const ytdl = require("ytdl-core");

const env = process.env
var port = env.PORT || 3000

app.set("view engine", "ejs");
app.use(express.static('public'));
app.enable("trust proxy");


app.get("/", (req, res) => {
    res.render(path.join(__dirname, "/views/index"));
});


app.listen(port, () => {
    console.log(`[EXPRESS] Web server is now listening on port ${port}`)
});