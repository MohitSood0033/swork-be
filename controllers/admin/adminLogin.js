require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());




const adminLogin = async (req, res) => {
  try {
    // const body = req.body;
    //   console.log('bbbbbb',body)
    // Get user input
    console.log('reqqq',req.body);
    const { phone, password } = req.body;
    // Validate user input
    if (!(req.body.phone && req.body.password)) {
      res.status(400).send("All input is required");
    }
    const oldUser = await mongoose.connection.db
      .collection("admin")
      .find()
      .toArray();
    if (!oldUser) {
      return res
        .status(409)
        .json({ message: "Admin Not Exist. Please Resister First" });
    }
    console.log('00000000000000000000',oldUser);
    console.log('11111111111',oldUser[0].phone,phone)
    if (oldUser[0].phone == phone) {
      console.log('8888888888888')
      let password1 = oldUser[0].password;
      let verifyPassword = await bcrypt.compare(password, password1);
      if (verifyPassword) {
        console.log('verifyPassword',verifyPassword)
        const token = jwt.sign({ id: oldUser[0]._id }, process.env.TOKEN_KEY, {
          expiresIn: "28d",
        });
        return res
          .status(200)
          .json({ message: "Admin User User Login SuccessFully", token });
      }
      if (!verifyPassword) {
        return res.status(400).json({ message: "Password not matched" });
      }
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// const adminLogin = async (req, res) => {
// try {
//   const body = req.body;
//   console.log('bbbbbb',body)
//   if (!(body.phone && body.password)) {
//       res.status(400).send("BOTH FIELD IS REQUIRE")
//   }
//   const user = await mongoose.connection.db
//         .collection("admin").find({ phone: body.phone });
//         console.log('uuuuuuuuuuuuu',user)
//   if (!user) {
//       return res.status(401).send({
//           message: "USER NOT FOUND"
//       });
//   }
//   if (user) {
//       const validpassword = await bcrypt.compare(body.password, user.password);
//       if (!validpassword) {
//           return res.status(400).send({
//               message: "incorrect password"
//           })
//       }
//       const jwttoken = jwt.sign({
//           id: user._id
//       }, 'secret');
//       return res.status(200).send({
//           succesfull: true,
//           data: user,
//           message: 'login successfull',
//           sucess: 'welcome to token',
//           token: jwttoken
//       })
//   }
// } catch (err) {
//   console.log(err);
// }}
module.exports = adminLogin;
