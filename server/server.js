const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const dataModel = require("./models/users");
const phoneModel = require("./models/phonedata");

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://192.168.100.3:8081', 'http://192.168.100.3:8080']
}));    

require('dotenv').config();

mongoose.connect("mongodb+srv://maestrocj48:mynativeapp2025@reactnative.j7t9p.mongodb.net/nativedata?retryWrites=true&w=majority&appName=ReactNative", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.log('Error connecting to MongoDB:', error));


app.listen(8080,()=>{
  console.log("Port 8080 is live !");
});

// register user name,email and password with dataModel Schema to mongoDB.
app.post("/register", async (req, res) => {
  const {name,email,password} = req.body;
    try {
      // Hashing user password before saving
      const hashedPassword = await bcrypt.hash(password,10);
      const newUser = new dataModel({name,email,password: hashedPassword });
      await newUser.save();
      res.status(200).send("User saved Successfully");
    } catch (error) {
      console.log(error);
      res.status(500).send("Error, Unable to save user details");
    }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body; // Correctly extract email and password from req.body
  try {
    const user_record = await dataModel.findOne({ email: email });

    if (!user_record) {
      return res.status(404).json("User record does not exist");
    }

    const isPasswordValid = await bcrypt.compare(password, user_record.password);

    if (isPasswordValid) {
      return res.status(200).json("Log in successful");
    } else {
      return res.status(401).json("Wrong password");
    }

  } catch (error) {
    return res.status(500).json({ message: "Error occurred during authentication", error });
  }
});

app.post('/insert', async(req,res)=>{
  const {name,phoneNumber} = req.body;
  try {
    const phoneBookData = new phoneModel({name:name,phoneNumber:phoneNumber});
    await phoneBookData.save();
    res.status(201).send("Data saved successfuly");
  } catch (error) {
    console.log(error);
    res.status(501).send("Failed to connect to database");
  }
});

app.get('/read',async(req,res)=>{
  try {
    const result = await phoneModel.find({});
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error reading data");
  }
});

app.put('/update', async (req, res) => {
  const { id, updateName, updateNumber } = req.body;
  try {
    console.log("Looking for user with ID:", id);  // Debugging line
    const user = await phoneModel.findById(id);
    if (user) {
      console.log("User found:", user);  // Debugging line
      user.name = updateName;
      user.phoneNumber = updateNumber;
      await user.save();
      res.send("Update Successful");
    } else {
      res.status(404).send("User Data not found");
    }
  } catch (error) {
    console.log("Unable to find requested data", error);
    res.status(500).send("Error updating user Data");
  }
});


app.delete('/delete/:id',async (req,res)=>{
  const id = req.params.id;
  await phoneModel.findByIdAndDelete(id).exec();
  res.send("User Data Deleted");
});
