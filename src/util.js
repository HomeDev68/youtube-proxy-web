const got = require("got");
const fs = require("fs");
const videoIDRegex = /^[a-zA-Z0-9-_]{11}$/;

function validateID(id) {
    return videoIDRegex.test(id.trim());
}

function filterFormat(formats, itag) {
    return formats.filter((format) =>
      itag ? itag == format.itag : format.has_video && format.has_audio
    ).pop();
}

function fancyTimeFormat(duration) {
  // Hours, minutes and seconds
  const hrs = ~~(duration / 3600);
  const mins = ~~((duration % 3600) / 60);
  const secs = ~~duration % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = "";

  if (hrs > 0) {
    ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

async function getVidLikesDislikes(id) {

    var url = `https://returnyoutubedislikeapi.com/votes?videoId=${id}`
    var options = { maxRedirects: 2, throwHttpErrors: false };

    try {
        var request = await got.get(url, options).json()
        return request
        //res.status(200).send("OK")
    } catch(e) {
        console.error(e);
        return "Error"

    }
}

async function checkFolderExists(path) {
  console.log(path)
  var folder = fs.existsSync(path);
  return folder;
};


  module.exports = {
    validateID: validateID,
    filterFormat: filterFormat,
    fancyTimeFormat: fancyTimeFormat,
    getVidLikesDislikes: getVidLikesDislikes,
    checkFolderExists: checkFolderExists
  }