const https = require('https');
const http = require('http');
const express = require('express');
const fs = require("fs");
const mongodb = require("mongodb");

const app = express();
const port = 3000;

if (!process.env.VIDEOS_PATH) throw new Error("Please specify the path to videos using the environment variable VIDEOS_PATH.");
if (!process.env.VIDEO_STORAGE_HOST) throw new Error("Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST.");
if (!process.env.VIDEO_STORAGE_PORT) throw new Error("Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT.");
if (!process.env.DBHOST) throw new Error("Please specify the databse host using environment variable DBHOST.");
if (!process.env.DBNAME) throw new Error("Please specify the name of the database using environment variable DBNAME");

const VIDEOS_PATH = process.env.VIDEOS_PATH;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
console.log(`Forwarding video requests to ${VIDEO_STORAGE_HOST}:${VIDEO_STORAGE_PORT}.`);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

function main() {
    console.log("Connect to the MongoDB");
    return mongodb.MongoClient.connect(DBHOST) // Connect to the database.
        .then(client => {
            console.log("Connect to the database");
            const db = client.db(DBNAME);
            const videosCollection = db.collection("videos");
        
            app.get("/video", (req, res) => {
                const videoId = new mongodb.ObjectID(req.query.id);
                videosCollection.findOne({ _id: videoId })
                    .then(videoRecord => {
                        if (!videoRecord) {
                            res.sendStatus(404);
                            return;
                        }

                        console.log(`Translated id ${videoId} to path ${videoRecord.videoPath}.`);
        
                        const forwardRequest = http.request( // Forward the request to the video streaming microservice.
                            {
                                host: VIDEO_STORAGE_HOST,
                                port: VIDEO_STORAGE_PORT,
                                path:`/video?path=${videoRecord.videoPath}`, // Video path retrieved from the database.
                                method: 'GET',
                                headers: req.headers
                            }, 
                            forwardResponse => {
                                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                                forwardResponse.pipe(res);
                            }
                        );
                        
                        req.pipe(forwardRequest);
                    })
                    .catch(err => {
                        console.error("Database query failed.");
                        console.error(err && err.stack || err);
                        res.sendStatus(500);
                    });
            });
            
            app.listen(port, () => {
                console.log(`Microservice listening, please load the data file db-fixture/videos.json into your database before testing this microservice.`);
            });
        });
}

main()
    .then(() => console.log("Microservice online."))
    .catch(err => {
        console.error("Microservice failed to start.");
        console.error(err && err.stack || err);
    });