require("dotenv").config();
const express = require("express");
require("./db/connect");
const Info = require("./models/info");
const auth = require("./middleware/auth");
const Task = require("./models/task");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 4000;

app.use(cookieParser());
app.use(express.json());

app.post("/users", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const token_key = req.body.token;

    const ragisterInfo = new Info(req.body);

    const singUpdata = await Info.findOne({ email: email });
    console.log("singUpdata>>>>", singUpdata);
    if (!singUpdata) {
      const token = await ragisterInfo.generateAuthToken();
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 60000),
        httpOnly: true,
      });

      const ragistered = await ragisterInfo.save();
      res.send(ragisterInfo);
    } else {
      res.send({ message: "This E-mail is already Used" });
    }
  } catch (error) {
    res.send(error);
  }
});

///////////* Auth Task *///////////

const authTask = async (req, res, next) => {
  try {
    const token = req.cookies;
    const tokenKey = token.jwt;

    if (tokenKey) {
      const verifyUser = jwt.verify(tokenKey, process.env.SECRET_KEY);
      if (verifyUser) {
        if (verifyUser.iat * 1000 > Date.now()) {
          const user = await Info.findOne({ _id: verifyUser._id }).select([
            "-password",
            "-tokens",
          ]);
          req.user = user;
          return next();
        } else {
          return res.status(401).json({
            success: false,
            message: "Token is expired",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Unthorized access",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Unthorized access",
      });
    }
  } catch (error) {
    res.send(error);
    console.log("AuthTask Error >>>> ", error);
  }
};

///////////* User Task Status *///////////
app.get("/taskstatus", authTask, async (req, res) => { 
  try{
    const nameSchema = new Task(req.body.status);
    const status = nameSchema.status
    console.log("status>>>>>", status);
    const token = req.cookies;
      const tokenKey = token.jwt;
      console.log("tokenKey>>>>>", tokenKey);
    // res.send(tokenKey);
    res.send(status);
  }catch(err){
    res.send(err);
  }
  
});

///////////* User Task *///////////
app.get("/usertask", authTask, async (req, res) => {
  const userId = req.user.id;
  try {
    const userTask = await Task.find({ owner: userId });
    res.json(userTask);
  } catch (error) {
    res.send(error);
  }
});

///////////* Create Task *///////////

app.post("/tasks", authTask, async (req, res) => {
  // console.log(`this is a cookie >>>> ${req.cookies.jwt}`);
  // console.log("authCookie>>>", authCookie);
  // console.log(req.user, 'User>>>');
  try {
    const nameSchema = new Task(req.body);
    const taskData = await nameSchema.save();
    console.log("taskData>>>>", taskData);
    return res.status(201).send(taskData);
  } catch (error) {
    return res.send(error);
    // console.log(error);
  }
});

///////////* Get All Tasks *///////////

app.get("/tasks", async (req, res) => {
  try {
    const getAllData = await Task.find();
    //  console.log("Get All Data >>> ", getAllData);
    res.send(getAllData);
  } catch (error) {
    res.send(error);
    // console.log(error);
  }
});

///////////* Get One Task *///////////

app.get("/tasks/:id", async (req, res) => {
  try {
    const task_id = req.params.id;
    // console.log("Task ID >>>> ", task_id);
    const findTask = await Task.findOne({ _id: task_id });
    res.send(findTask);
    // console.log("updataTask >>>> ", .);
  } catch (error) {
    res.send(error);
    // console.log(error);
  }
});

///////////* Update Task *///////////

app.patch("/tasks/:id", authTask, async (req, res) => {
  try {
    const update_id = req.params.id;
    const update_name = req.params.name;
    const updateTask = await Task.findByIdAndUpdate(
      update_id,
      { name: req.body.name },
      { new: true }
    );
    res.send(updateTask);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

///////////* Delete Task *///////////

app.delete("/tasks/:id", authTask, async (req, res) => {
  try {
    const task_id = req.params.id;
    const deleteTask = await Task.findByIdAndDelete({ _id: task_id });
    res.send(deleteTask);
  } catch (err) {
    res.send(err);
    console.log(err);
  }
});

///////////* User Login *///////////

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const logindata = await Info.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, logindata.password);
    const token = await logindata.generateAuthToken();
    let multiple = [{ email: email, tokenKey: token }];
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 600000),
      httpOnly: true,
    });

    if (isMatch) {
      res.status(201).send(multiple);
      // res.send(Cookies);
    } else {
      res.send({ message: "Invalid Password" });
    }
  } catch (err) {
    res.send({ message: "Invalid login Details" });
  }
});


///////////* Get All User Data *///////////

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
