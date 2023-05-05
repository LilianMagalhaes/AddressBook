const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ServerStyleSheet } = require("styled-components");
const { Int32 } = require("mongodb");

const APP = express();
APP.use(cors());
APP.use(bodyParser.json());
const PORT = 4200;

// node server connection//
APP.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
APP.use(express.json());

APP.use(express.static(__dirname + "/public"));

APP.get("/", (req, res) => {
  console.log("Route GET /  Redirection vers index.html");
  res.redirect("index.html");
});

// Set the "strictQuery" setting to false in mongoose
mongoose.set("strictQuery", false);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/PWServerConection", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error);
  });

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const ContactsDbSchema = new mongoose.Schema({
  nameTitle: String,
  nameFirst: String,
  nameLast: String,
  stNumber: String,
  stName: String,
  city: String,
  province: String,
  country: String,
  postcode: String,
  category: String,
  email: String,
  phone: String,
  dob: String,
  picture: String,
});

const ContactsDb = mongoose.model("ContactsDb", ContactsDbSchema);

// Get all records from the DB (READ)
APP.get("/getContacts", async (request, response) => {
  console.log("Route GET /getContacts");
  try {
    const result = await ContactsDb.find().exec();
    response.json(result);
  } catch (error) {
    response.status(500).send(error);
  }
});

APP.post("/addContact", async (request, response) => {
  console.log("Route POST /addContact");
  console.log(request.body);
  try {
    const contactInfo = new ContactsDb(request.body);
    const result = await contactInfo.save();
    response.send(result);
  } catch (error) {
    response.status(500).send(error)
  }
});

// Delete a record (DELETE)
APP.delete("/deleteContact", async (request, response) => {
  console.log("Route DELETE /deleteContacts");
  console.log(request.body);
  try {
    let result = await ContactsDb.deleteOne({ _id: request.body }).exec();
    response.send(result);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

APP.listen(PORT, () => {
  console.log(`New conection... Server running at http://localhost:${PORT}/`);
});

//// Update a record in the DB (UPDATE)
//APP.put("/updateContact", async (request, response) => {
//  console.log("Route PUT /updateContact");
//  console.log(request.body);
//  try {
//    const contactInfo = await ContactsDb.findById(_id: request.body).exec();
//    if (!contactInfo) return response.status(404).send("Contact not found");
//    contactInfo.set(request.body);
//    const result = await contactInfo.save();
//    response.send(result);
//  } catch (error) {
//    response.status(500).send(error);
//  }
//});
