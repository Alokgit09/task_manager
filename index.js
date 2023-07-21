require('dotenv').config()
const express = require("express");
require("./db/connect");
const Info = require("./models/info");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.post("/users", async (req, res) => {
  try{

  const ragisterInfo = new Info(req.body);
 
  const token = await ragisterInfo.generateAuthToken();
  res.cookie("jwt", token);
  console.log("cookie info" + cookie);
  const ragistered = await ragisterInfo.save();
  res.send(ragisterInfo);

}catch(error){
  res.send(error);
}
  
});



app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const logindata = await Info.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, logindata.password);
    
    const token = await logindata.generateAuthToken();
    console.log("the token part is>>>>>>> " + token);

    if (isMatch) {
      res.status(201).send(logindata);
    } else {
      res.send("Invalid Password");
    }
  }catch(err) {
    res.send("Invalid login Details");
  }
});

app.get("/users", async (req, res) => {
  try {
    const taskData = await Info.find();
    res.send(taskData);
    console.log(res);
  } catch (e) {
    res.send(e);
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`connection is setup at ${port}`);
});
