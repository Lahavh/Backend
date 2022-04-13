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
const mongodbUsersCollectionName = "users";
const mongodbPostsCollectionName = "posts";

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
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).find({}).toArray((error, users) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      users = users || [];
      response.send(users);
    });
  });
});

app.get("/user/::email/::password", (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    const findQuery = {
      email: request.params.email,
      password: request.params.password
    };

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).findOne(findQuery, { projection: { "_id": false } }, (error, user) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      response.send(user);
    });
  });
});

app.post("/user", jsonParser, (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).insertOne(request.body, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      response.send(request.body);
    });
  });
});

app.post("/post", jsonParser, (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    mongo.db(mongodbName).collection(mongodbPostsCollectionName).insertOne(request.body, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }
    });

    const findQuery = { id: request.body.authorId };
    const updateQuery = { $push: { myPostsIds: request.body.id } };

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).updateOne(findQuery, updateQuery, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
    });
  });

  response.send(request.body);
});

app.put("/edit-post", jsonParser, (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    const findQuery = { id: request.body.id };
    const updateQuery = { $set: { title: request.body.title, body: request.body.body } };

    mongo.db(mongodbName).collection(mongodbPostsCollectionName).updateOne(findQuery, updateQuery, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      response.send(request.body);
    });
  });
});

app.put("/like-post", jsonParser, (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    const findQuery = { id: request.body.userId };
    const updateQuery = { $push: { likedPostsIds: request.body.postId } };

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).updateOne(findQuery, updateQuery, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      response.send(request.body);
    });
  });
});

app.put("/dislike-post", jsonParser, (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    const findQuery = { id: request.body.userId };
    const updateQuery = { $pull: { likedPostsIds: request.body.postId } };

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).updateOne(findQuery, updateQuery, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      response.send(request.body);
    });
  });
});

app.put("/delete-post", jsonParser, (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    const updateQuery = {
      $pull: {
        myPostsIds: request.body.postId,
        likedPostsIds: request.body.postId
      }
    };

    mongo.db(mongodbName).collection(mongodbUsersCollectionName).updateMany({}, updateQuery, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }
    });

    const deleteQuery = { id: request.body.postId };
    
    mongo.db(mongodbName).collection(mongodbPostsCollectionName).deleteOne(deleteQuery, (error) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      response.send(request.body);
    });
  });
});

app.get("/posts", (request, response) => {
  mongoClient.connect(mongodbURL, (error, mongo) => {
    if (error) {
      return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }

    mongo.db(mongodbName).collection(mongodbPostsCollectionName).find({}).toArray((error, posts) => {
      if (error) {
        return response.status(httpStatusCodes.INTERNAL_SERVER_ERROR).send(error);
      }

      mongo.close();
      posts = posts || [];
      response.send(posts);
    });
  });
});