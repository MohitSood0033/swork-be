require("dotenv").config();
require("../../db/connection");
const express = require("express");
const DeliveryAddress = require("../../model/address");
const cors = require("cors");
const app = express();
app.use(express.json({ limit: "50mb" }));
const jwt = require("jsonwebtoken");
// FOR RESOVLE THE CORS ERROR
app.use(cors());
const Customer = require("../../model/customer");

const createCustomerDeliveryAddress = async (req, res) => {
  try {
    console.log(req.body)
    // let token = req.headers["x-access-token"];
    // let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    // let id = decoded.id;
    const customer = await Customer.findOne({ _id: req.body.cu_id });
    console.log(customer)

    // Get user input
    const {  firstname, lastname, streetAddress, city, state, pin,cu_id } = req.body;

    // Validate user input
    if (!(firstname && lastname  && city && streetAddress )) {
      return res.status(400).send({ message: "All input is required" });
    }

    console.log(customer);
    // Create user in our database
    const customerDeliveryAddress = await DeliveryAddress.create({
     
      firstname: firstname,
      lastname: lastname,
      city: city,
      streetAddress: streetAddress,
      state: state,
      pin: pin,
      customer_id:customer
    });

    res.status(201).json({ customerDeliveryAddress });
  } catch (err) {
    console.log(err);
  }
};

const getDeliveryAddressById = async (req, res) => {
    console.log(req.body)
    try {
      const { customer_id } = req.body;
      const getAdressbyId = await DeliveryAddress.find({
        $and: [
          {
            customer_id: customer_id,
          },
        ],
      });
      console.log(getAdressbyId);
      if (getAdressbyId !== null) {
        res.status(200).json(getAdressbyId);
      }
      if (getAdressbyId == null) {
        return res.status(400).json("Adress not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };


  const getselectedDeliveryAddressById = async (req, res) => {
    console.log(req.body)
    try {
      const { address_id } = req.body;
      const getAdressbyId = await DeliveryAddress.find({
        $and: [
          {
            _id: req.body.addressid,
          },
        ],
      });
      console.log(getAdressbyId);
      if (getAdressbyId !== null) {
        res.status(200).json(getAdressbyId);
      }
      if (getAdressbyId == null) {
        return res.status(400).json("Adress not exist");
      }
    } catch (err) {
      console.log(err);
    }
  };



module.exports = { createCustomerDeliveryAddress,getDeliveryAddressById,getselectedDeliveryAddressById };
