require("dotenv").config();
require("../db/connection");
const express = require("express");
const payout = require("../model/payoutRequest");
const ShopUser = require("../model/shopUser");

const jwt = require("jsonwebtoken");
const User = require("../model/user");

const payoutRequest = async (req, res) => {
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const shopUser = await ShopUser.findOne({ _id: id });
  // console.log(shopUser.bankDetails);
  const serviceUser = await User.findOne({ _id: id });
  // console.log(serviceUser.bankDetails);
  if (shopUser) {
    const payoutRequest = await payout.create({
      amount: req.body.amount, // sanitize: convert email to lowercase
      payoutRequestStatus: "unpaid",
      user: id,
      userType:shopUser.type,
      bankDetails: shopUser.bankDetails,
    });
    if (payoutRequest) {
      return res.status(200).json({ message: "Payout request send to Admin" });
    }
  }if(serviceUser){
    const payoutRequest = await payout.create({
      amount: req.body.amount, // sanitize: convert email to lowercase
      payoutRequestStatus: "unpaid",
      user: id,
      userType:serviceUser.type,
      bankDetails: serviceUser.bankDetails,
    });
    if (payoutRequest) {
      return res.status(200).json({ message: "Payout request send to Admin" });
    }
  }
  if (!payoutRequest) {
    return res
      .status(400)
      .json({ message: "*Payout request send to Admin Failed!" });
  }
};

const getpayoutRequest = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    console.log('idddd',id);
    const payoutRequest = await payout.find({
      $and: [
        { user: id },
        { payoutRequestStatus: "paid"},
      ],
    });
    
    res.status(200).send(payoutRequest);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  getpayoutRequest,
  payoutRequest,
};
