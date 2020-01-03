const https = require('https');
const express = require('express');
const fs = require("fs");
const app = express();
const port = 3000;

if (!process.env.VIDEOS_PATH) throw new Error("Please specify the path to videos using the environment variable VIDEOS_PATH.");
const VIDEOS_PATH = process.env.VIDEOS_PATH;

//root
app.get('/', (req, res) => {
    res.send('Welcome to micro video');
});

//video
app.get('/video', (req, res) => {
    const path = "./videos/SampleVideo_1280x720_1mb.mp4";
    fs.stat(path, (err, stats) => {
        if (err) {
            console.error("An error occured");
            res.sendStatus(500);
            return;
        }

        res.writeHead(200, {
            "Content-Length": stats.size,
            "Content-Type": "video/mp4",            
        })

        fs.createReadStream(path).pipe(res);
    });
});  

//videos
app.get("/videos", (req, res) => {
    fs.readdir(VIDEOS_PATH, (err, files)  => {
        if (err) {
            console.error("An error occurred.");
            console.error(err && err.stack || err);
            res.sendStatus(500);
            return;            
        }
        else {
            res.json({
                videos: files,
            })
        }
    });
});

/* 
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(port, () => {
    console.log(`Microservice listening on port ${port}, point your browser at https://localhost:3000/video`);
});
*/

app.listen(port, () => {
    console.log(`Microservice listening on port ${port}, point your browser at http://localhost:3000/video`);
});