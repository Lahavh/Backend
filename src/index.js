const express = require("express");
const app = express();
const cors = require("cors");
const httpStatusCodes = require("http-status-codes").StatusCodes;

app.use(cors({
    origin: "*"
}));

const jsonParser = require('body-parser').json();

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const mongodbURL = "mongodb://localhost:27017";
const mongodbName = "makeup-community";
const mongodbCollectionName = "users";

const port = "5555";

app.listen(port, () => {
    console.log("Listening on port " + port + "...");
});

app.get("/", (request, response) => {
    response.send("Makeup Community Backend Service");
});

app.get("/users", (request, response) => {
    mongoClient.connect(mongodbURL, (error, mongo) => {
        if (error) {
            console.log(error);
            return;
        }

        mongo.db(mongodbName).collection(mongodbCollectionName).find({}).toArray((error, users) => {
            if (error) {
                console.log(error);
                return;
            }

            mongo.close();
            users = users || [];
            response.send(users);
        });
    });
});


app.post("/user", jsonParser, (request, response)=> {
    mongoClient.connect(mongodbURL, (error, mongo)=> {
        if(error) {
            return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
        }

        mongo.db(mongodbName).collection(mongodbCollectionName).insertOne(request.body, (error) => {
            if(error) {
                return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
            }

            mongo.close();
            response.send(request.body);
        });
    });
});