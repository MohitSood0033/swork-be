require("dotenv").config();
require("../../db/connection");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const ShopUser = require("../../model/shopUser");
const app = express();
const Subscription = require("../../model/subscriptionPlan.js");
const cron = require("node-cron");
const moment = require("moment");

app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

const ShopUserlogin = async (req, res) => {
  console.log(req.body)
  try {
    // Get user input
    const { phone, password, deviceToken } = req.body;
    // Validate user input
    if (!(phone && password)) {
      res.status(400).send("All input is required");
    }
    let getUser = await ShopUser.findOne({ phone: { $eq: req.body.phone } });
    console.log("getUser",getUser)
    var shopUserId = getUser._id
    if (!getUser) {
      return res
        .status(400)
        .json({ message: "ShopUser not exist! Please Signup first!" });
    }
    if (getUser.status == 1 || 2) {
      let password = getUser.password;
      let verifyPassword = await bcrypt.compare(req.body.password, password);
      console.log(shopUserId);
      const getSubscription = await Subscription.findOne({ shopUserId: shopUserId });
      console.log('41 41 41',getSubscription);
      if(getSubscription){
      const subscriptionStartTime = moment(getSubscription.subscriptionDate); // Set the subscription start time
      // const subscriptionEndTime = moment("2023-06-29T10:55:32"); // Set the subscription start time
      const subscriptionEndTime = moment(subscriptionStartTime).add(1, 'year');
    
      cron.schedule('0 0 * * *', async () => {
        const currentTime = moment();
        console.log('40',currentTime);
        if (currentTime >= subscriptionStartTime && currentTime < subscriptionEndTime) {
          // Subscription is active
          console.log('Subscription is active.');
        } else if (currentTime >= subscriptionEndTime) {
          console.log('46',shopUserId);
          const getShopUser = await ShopUser.findOne({ _id: shopUserId });
          console.log("getShopUser", getShopUser);
        
          getUser = await ShopUser.updateOne(
            { _id: shopUserId },
            {
              $set: {
                status: 1,
              },
            },
            { new: true }
          );
          // Subscription has ended, send message
          console.log(subscriptionStartTime);
          console.log("Subscription has ended");
        }
      }, {
        timezone: 'Asia/Kolkata' // Adjust timezone as per your requirement
      });
    }
      console.log('65',getUser);
      if (verifyPassword) {
        const token = jwt.sign({ id: getUser._id }, process.env.TOKEN_KEY, {
          expiresIn: "28d",
        });
        getUser = await ShopUser.updateOne(
          { _id: { $eq: getUser._id } },
          {
            $set: {
              deviceToken: deviceToken,
            },
          },
          { new: true }
        );
        console.log('79 79 79 79',getUser);
        return res
          .status(200)
          .json({ message: "Shop User Login SuccessFully", getUser, token });
      } else {
        return res.status(400).json({ message: "Password not matched" });
      }
    }
    if (getUser.status == 0) {
      return res
        .status(400)
        .json({ message: "Your Account Deactivated Please Contact to Admin" });
    } else {
      res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = ShopUserlogin;
