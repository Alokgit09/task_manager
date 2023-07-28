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

const authTask = (req, res, next) =>{
  try {
    const token = req.cookies;
    const tokenKey = token.jwt;
   
    if(tokenKey){

      const verifyUser = jwt.verify(tokenKey, process.env.SECRET_KEY );
    
      if(verifyUser){

        if(verifyUser.iat * 1000 > Date.now()){
          return next()
        }else{
          return res.status(401).json({
            success: false,
            message: 'Token is expired'
          });
        }
    
      }else{
      return res.status(401).json({
        success: false,
        message: 'Unthorized access'
        });
    }

    }else{
      return res.status(401).json({
        success: false,
        message: 'Unthorized access'
      });
    }
    }catch(error){
    res.send(error);
    console.log("AuthTask Error >>>> ", error);
    }
}

///////////* Create Task *///////////

app.post("/tasks", authTask, async (req, res) => {
  // console.log(`this is a cookie >>>> ${req.cookies.jwt}`);
    // console.log("authCookie>>>", authCookie);
  try {
    const nameSchema = new Task(req.body);
    const taskData = await nameSchema.save();
    console.log('send', taskData)
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
    // console.log("updataTask >>>> ", findTask);
  } catch (error) {
    res.send(error);
    // console.log(error);
  }
});

///////////* Update Task *///////////

app.patch("/tasks/:id", async (req, res) => {
  try {
    const update_id = req.params.id;
    const update_name = req.params.name;

    console.log(update_id,);
    const updateTask = await Task.findByIdAndUpdate(update_id,{name:req.body.name},{new:true});
    console.log("Data Updated Successfuly>>>",updateTask);
    res.send(updateTask);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});


///////////* User Login *///////////

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const logindata = await Info.findOne({ email: email });

    console.log(logindata,'data')

    const isMatch = await bcrypt.compare(password, logindata.password);
    console.log(isMatch, 'isMatch')

    const token = await logindata.generateAuthToken();
    console.log(token, 'token')
    let multiple = [{ email: email, tokenKey: token }];
    console.log("token_id>>>>>>>", multiple);
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
