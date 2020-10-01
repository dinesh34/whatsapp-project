import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import Messages from "./dbMessages.js";
import dbMessages from "./dbMessages.js";
import Pusher from "pusher";

//app config
const app = express();
const port = process.env.PORT || 9000;

const db = mongoose.connection;
db.once("open", () => {
  console.log("DB connected");

  const collection_messages = db.collection("messagecontents");
  const changeStream = collection_messages.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.user,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering Pusher");
    }
  });
});

const pusher = new Pusher({
  appId: "##############",
  key: "##############",
  secret: "##############",
  cluster: "##############",
  encrypted: true,
});

//middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

//DB config

const connURL =
  "mongodb+srv://<user-name>:Fginl4mgU4IJsEAC@cluster0.bcepw.mongodb.net/<project-name>?retryWrites=true&w=majority";

mongoose.connect(connURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//???

//api routes
app.get("/", (req, res) => {
  res.status(200).send("working api");
});

app.post("/messages/new", (req, res) => {
  const inMessage = req.body;

  Messages.create(inMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.listen(port, () => {
  console.log("listening.........");
});
