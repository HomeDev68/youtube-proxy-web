require("dotenv").config();

const { spawn } = require("child_process");
const env = process.env;

function run() {

    var limit = env.MAX_MEMORY_LIMIT || "512"
    var autorestart = env.AUTO_RESTART || "true"
    let date = new Date().toLocaleString();

    console.log(`${date} - Starting Proxy - Memory Limit: ${limit}MB`);

    var program = spawn("node", [`--max-old-space-size=${limit}`, `server.js`], {
        stdio: "inherit",
        env: {
            MAX_MEMORY_LIMIT: limit,
            ...process.env
        }
    });

    program.on("spawn", (data) => {
        let date = new Date().toLocaleString();
        console.log(`${date} - Proxy Started`);
    });

    program.on("exit", (code, singal ) => {
        if(autorestart === "true") {
            let date = new Date().toLocaleString();
            console.log(`${date} - Proxy Process exited with code ${code} with singal ${singal}`);
            run();
        } else {
            let date = new Date().toLocaleString();
            console.log(`${date} - Proxy Process exited with code ${code} with singal ${singal}`);
        };
    });

};

// ===================== TEMPORARY FUNCTION =====================
const path = require("path");
const fs = require("fs");
const { checkFolderExists } = require("./src/util")
var dataFolder = env.DATA_FOLDER || "./data"
var dataThumbnails = path.resolve(`${dataFolder}/thumbnails`);
var dataChannelIcons = path.resolve(`${dataFolder}/ChannelIcons`);

async function dataCleanup() {

    var ThumbnailsExist = checkFolderExists(dataThumbnails);
    var ChannelIconssExist = checkFolderExists(dataChannelIcons);

    // Check if the thumbnails data folder exists or not.
    if(ThumbnailsExist) {

        try {
            console.log(`Deleting all video thumbnails`)
            var files = fs.readdirSync(dataThumbnails);
            files.map(file => {
                fs.rmSync(`${dataThumbnails}/${file}`);
            });
        } catch(e) {

        }

    } else {

    }

    // Check if the channel icons data folder exists or not.
    if(ChannelIconssExist) {

        try {
            console.log(`Deleting all channel profile icons`)
            var files = fs.readdirSync(dataChannelIcons);
            files.map(file => {
                fs.rmSync(`${dataChannelIcons}/${file}`);
            });
        } catch(e) {

        }

    } else {

    }

};




run();
setInterval(dataCleanup, 30000);