const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const moment = require("moment");
const app = express();
const { Person } = require("./person");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/persons", {
  useNewUrlParser: true,
});

app.get("/", (req, res) => {
  const fileLocation = path.join(__dirname, "./public/index.html");
  res.sendFile(fileLocation);
});

app.get("/api/exercise/users", async (req, res) => {
  const allusers = await Person.find({}).exec();
  res.json(allusers);
});

app.post("/api/exercise/new-user", async (req, res) => {
  const userName = req.body.username;

  try {
    const exisitngPerson = await Person.findOne({ name: userName });

    if (exisitngPerson) {
      return res.json({ info: "person already added" });
    } else {
      const newPerson = new Person({ name: userName });
      newPerson.save();
      const personObj = { username: userName, _id: newPerson._id };
      return res.json(personObj);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error");
  }
});

app.post("/api/exercise/add", async (req, res) => {
  const userId = req.body.userId;
  const description = req.body.description;
  const duration = req.body.duration;
  const date =
    req.body.date != undefined &&
    moment(req.body.date, "DD/MM/YYYY", true).isValid()
      ? Date.parse(req.body.date)
      : Date.now();

  try {
    const exisitngPerson = await Person.findByIdAndUpdate(
      userId,
      {
        $push: {
          exerciseList: {
            description: description,
            duration: duration,
            date: date,
          },
        },
      },
      { new: true }
    );
    return res.json(exisitngPerson);
  } catch (err) {
    console.error(err);
    res.json({ error: "server error" });
  }
});

app.get("/api/exercise/log", async (req, res) => {
  const userId = req.query.userId;
  const limit = req.query.limit;

  try {
    const exisitngPerson = await Person.findById(userId);
    if (exisitngPerson) {
      res.json(exisitngPerson.exerciseList.slice(0, limit));
    } else {
      res.json({ error: "user not found" });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: "server error" });
  }
});

app.listen(3000, () => {
  console.log("server runnning on port 3000");
});
