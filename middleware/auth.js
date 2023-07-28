const jwt = require("jsonwebtoken");
const Register = require("../models/info");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("cookies Token >>>> ", token)
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Varify user >>>>" + verifyUser);

    const user = await Register.findOne({ _id:verifyUser._id });
    console.log("user find by id >>>" + user);

    next();
  } catch (error) {
    res.status(404).send(error);
  }
};


module.exports = auth;