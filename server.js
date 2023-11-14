require("dotenv").config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const got = require("got");
const { checkFolderExists, getVidLikesDislikes, fancyTimeFormat, validateID, filterFormat } = require("./src/util")

const ytdl = require("ytdl-core");
const ytsr = require('ytsr');
const ytpl = require("ytpl");



const env = process.env
var port = env.PORT || 3000
var apptitle = env.APP_TITLE || "YouTube Proxy"
var resultLimit = parseInt(env.RESULT_LIMIT || 25)
var useragent = env.USER_AGENT || "googlebot"

var dataFolder = env.DATA_FOLDER || "./data"
var dataThumbnails = path.resolve(`${dataFolder}/thumbnails`);
var dataChannelIcons = path.resolve(`${dataFolder}/ChannelIcons`);


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

app.get("/randomImage*", (req, res) => {

    var dataImages = path.resolve(`${dataFolder}/images`)
    var images = fs.readdirSync(dataImages);
    let random = images[Math.floor(Math.random() * images.length)]
    console.log(random)
    res.sendFile(`${dataImages}/${random}`)
    

})

app.get("/test", (req, res) => {

    testArray = [
        {
            name: "Hi"
        },
        {
            name: "Helloooooooooooooooooooooooooooooooooooooooooooo"
        },
        {
            name: "Helloooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo"
        }
    ]

    res.render(path.join(__dirname, "/views/test"), {
        apptitle: apptitle,
        result: testArray
    });
});

app.get("/search", async (req, res) => {
    var query = req.query.q
    var pageNum = parseInt(req.query.p || 1)
    if(!query) return res.redirect("/");

    try {
        var searchResult = await ytsr(query, { resultLimit, pages: pageNum })
        res.status(200).render(path.join(__dirname, "/views/search"), {
            apptitle: apptitle,
            result: searchResult["items"],
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



app.get("/channel/:id", async (req, res) => {
    var id = req.params.id

    try {
        var channelResult = await ytpl(id, { resultLimit })
        res.status(200).render(path.join(__dirname, "/views/channel"), {
            apptitle: apptitle,
            result: channelResult,
            cid: id
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



app.get("/watch/:id", async (req, res) => {
    var id = req.params.id

    try {
        ytdl.getVideoID(id)
    } catch (e) {
        console.log(`error: ${e}`)
        res.status(400).render(path.join(__dirname, "/views/error"), {
            apptitle: apptitle,
            title: "Invaild Video ID",
            content: ""
        });
    };


    try {
        var ratio = await getVidLikesDislikes(id);
        var video = await ytdl.getInfo(id, {
            highWaterMark: 1<<25,
            dlChunkSize: 1<<12,
            liveBuffer: 1<<62,
            isHLS: true,
            filter: 'video',
            filter: format => format.container === 'mp4', itag: [ 18, 133, 134, 135, 136, 140, 160, 394, 395, 396, 397, 398 ]
            });
            
        res.status(200).render(path.join(__dirname, "/views/watch"), {
            apptitle: apptitle,
            result: video,
            functions: {
                fancyTimeFormat: fancyTimeFormat
            },
            ratio: ratio 
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


app.get("/stream/:id", async (req, res) => {
    var id = req.params.id

    try {
        ytdl.getVideoID(id)
    } catch (e) {
        console.log(`error: ${e}`)
        res.status(400).render(path.join(__dirname, "/views/error"), {
            apptitle: apptitle,
            title: "Invaild Video ID",
            content: ""
        });
    };

    res.setHeader("content-type", "video/mp4")
    res.setHeader("connection", "Keep-Alive")
    res.setHeader('transfer-encoding', 'chunked')

    var stream = await ytdl(id, {
        highWaterMark: 1<<25,
        filter: 'videoandaudio',
        filter: format => format.container === 'mp4', itag: [ 18, 133, 134, 135, 136, 140, 160, 394, 395, 396, 397, 398 ]
        })
        
    stream.pipe(res)

});






// ================== API ==================


app.get("/api/", async (req, res) => {
    res.status(200).json({
        message: "OK"
    })
});

app.get("/api/search", async (req, res) => {
    var query = req.query.q
    var pageNum = parseInt(req.query.p || 1)
    if(!query) return res.redirect("/api/");

    try {
        var searchResult = await ytsr(query, { limit: resultLimit, pages: pageNum })
        let json = JSON.stringify(searchResult).replace(RegExp("https://i.ytimg.com/", "g"),`/` );
        json = json.replace(RegExp("https://yt3.ggpht.com", "g"), `/yt3`);
        var result = JSON.parse(json);
        res.status(200).json(result);
    } catch(e) {
        console.error(e);
        res.status(400).json({
            message: "Error",
            error: e.toString()
        });
    };

});

app.get("/api/channel/:id", async (req, res) => {
    var id = req.params.id
    var pageNum = parseInt(req.query.p || 1)

    try {
        var channelResult = await ytpl(id, { limit: resultLimit })
        let json = JSON.stringify(channelResult).replace(RegExp("https://i.ytimg.com/", "g"),`` );
        json = json.replace(RegExp("https://yt3.ggpht.com", "g"), ``);
        var result = JSON.parse(json);
        res.status(200).json(result);
    } catch(e) {
        console.error(e);
        res.status(400).json({
            message: "Error",
            error: e.toString()
        });
    };

});

app.get("/api/video/:id", async (req, res) => {
    var id = req.params.id
    if(!id) return res.redirect("/api/");

    try {
        var result = await ytdl.getInfo(id, {
            highWaterMark: 1<<25,
            dlChunkSize: 1<<12,
            liveBuffer: 1<<62,
            isHLS: true,
            filter: 'video',
            filter: format => format.container === 'mp4', itag: [ 18, 133, 134, 135, 136, 140, 160, 394, 395, 396, 397, 398 ]
            });
        res.status(200).json(result);
    } catch(e) {
        console.error(e);
        res.status(400).json({
            message: "Error",
            error: e.toString()
        });
    };

});





// ================== PROXY ==================

app.get(["/thumbnail/:videoID", "/tn/:videoID"], async (req, res) => {

    var videoID = req.params.videoID;
    if(!videoID) return res.status(400).json({ message: "Please specify the ID of a video."})

    var cachedFile = path.resolve(`${dataThumbnails}/${videoID}.jpg`);
    var file = fs.existsSync(cachedFile);

    // Check if file exists or not.
    //console.log(`${cachedFile} - ${videoID} - ${file}`)

    if(file) {

       // console.log("File does exist")
        try {
        var fileStream = fs.createReadStream(`${cachedFile}`);
        fileStream.pipe(res);
        } catch(e) {

        }

    } else {

        //console.log("File doesn't exist.")
        var url = `https://i.ytimg.com/vi/${videoID}/mqdefault.jpg`
        var options = { headers: { "User-Agent": useragent }, isStream: true, maxRedirects: 2, throwHttpErrors: false };

        try {
            var request = await got.get(url, options);
            var file = fs.createWriteStream(cachedFile);
            request.pipe(file);
            request.pipe(res);
        } catch(e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error", error: e})
        };

    };


});


app.get(["/channelIcon/:channelID", "/channelIcon/yt3/:channelID", "/channelIcon/ytc/:channelID", "/ci/:channelID", "/ci/yt3/:channelID", "/ci/ytc/:channelID"], async (req, res) => {
    
    if (req.url.startsWith("/channelIcon/") || req.url.startsWith("/ci/") || req.url.startsWith("/channelIcon/yt3/") || req.url.startsWith("/ci/yt3/") || req.url.startsWith("/channelIcon/ytc/") ||  req.url.startsWith("/ci/ytc/")) req.url = req.url.slice(4);
    
    var channelID = req.params.channelID;
    if(!channelID) return res.status(400).json({ message: "Please specify the ID of a channel."})

    var cachedFile = path.resolve(`${dataChannelIcons}/${channelID}.jpg`)
    var file = fs.existsSync(cachedFile);

    // Check if file exists or not.
    // console.log(`${cachedFile} - ${channelID} - ${file}`)

    if(file) {

        // console.log("File does exist")
        try {
        var fileStream = fs.createReadStream(`${cachedFile}`);
        fileStream.pipe(res);
        } catch(e) {
            
        }

    } else {

        // console.log("File doesn't exist.")
        var url = "https://yt3.ggpht.com/" + req.url
        var options = { headers: { "User-Agent": useragent }, isStream: true, maxRedirects: 2, throwHttpErrors: false };

        try {
            var request = await got.get(url, options);
            var file = fs.createWriteStream(cachedFile);
            request.pipe(file);
            request.pipe(res);
        } catch(e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error", error: e})
        };

    };


});




app.use((req, res) => {
    res.status(404).render("error.ejs", {
        apptitle: apptitle,
        title: "404",
        content: "Page Not Found",
    });
});


app.on("error", console.error);
process.on("unhandledRejection", console.error);

app.listen(port, () => {
    console.log(`[EXPRESS] Web server is now listening on port ${port}`)
});