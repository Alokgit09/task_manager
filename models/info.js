const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const infoSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 2,
  },
  email: {
    type: String,
    require: true,
    unique: [true, "E-mail is already here"],
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid E-mail");
      }
    },
  },
  password: {
    type: String,
    require: true,
    min: 6,
  },
  phone: {
    type: Number,
    min: 10,
    require: true,
    unique: true,
  },
  address: {
    type: String,
    require: true,
  },
  tokens:[{
    token:{
    type: String,
    require: true
    }
  }]
});

infoSchema.methods.generateAuthToken = async function() {
    try {
    const token = jwt.sign({_id:this._id}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({token:token});
    await this.save();
    console.log("tokenid>>>>" + token);
     return token;
    }catch(error){
     res.send("the error part" + error);
     console.log("token error part" + error);
    }
}


infoSchema.pre("save", async function(next){
  if(this.isModified("password")) {
  this.password = await bcrypt.hash(this.password, 10); 
  next();
  }
});

const SchemataskList = new mongoose.model("User", infoSchema);

module.exports = SchemataskList;