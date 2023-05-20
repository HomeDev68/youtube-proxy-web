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

run();