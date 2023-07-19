require("dotenv").config();
require("../../db/connection");
const express = require("express");
const Charges = require("../../model/charges");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());


const createExtraCharges = async(req,res)=>{
    console.log('rrrrrrr',req.body)
try{
    const {
        serviceCharge,
        taxCharges,
        deliveryDayCharges,
        pickupPerKmCharge,
        deliveryBoyDistanceKm,
      } = req.body;

        // Create createExtraCharges  in our database
    const createExtraCharges = await Charges.create({
        serviceCharge: serviceCharge,
        taxCharges: taxCharges,
        deliveryDayCharges: deliveryDayCharges,
        pickupPerKmCharge: pickupPerKmCharge,
        deliveryBoyDistanceKm: deliveryBoyDistanceKm, 
      });
      res.status(201).json({ createExtraCharges });

}catch(err){
    console.log(err)
}
}


const updateExtraCharges = async (req, res) => {
    const id = req.body.id;
    console.log("id", id);
    try {
      const getExtraCharges = await Charges.findOne({ _id: req.body.id });
      console.log("getShopOrder", getExtraCharges);
      const { serviceCharge, taxCharges, deliveryDayCharges, pickupPerKmCharge, deliveryBoyDistanceKm } = req.body;
      const updateExtraCharges = await Charges.updateMany(
        { _id: req.body.id },
        {
          $set: {
            serviceCharge: serviceCharge,
            taxCharges: taxCharges,
            deliveryDayCharges: deliveryDayCharges,
            pickupPerKmCharge: pickupPerKmCharge,
            deliveryBoyDistanceKm: deliveryBoyDistanceKm,
          },
        },
        { new: true }
      );
      if (updateExtraCharges) {
        console.log("id", id);
        res
          .status(200)
          .json({ message: " updateExtraCharges has updated successfully", id: id });
      } else {
        res.status(400).send("updateExtraCharges Update Failed");
      }
    } catch (err) {
      res.status(400).send(err);
      console.log(err);
    }
  };


  const getExtraCharges = async (req, res) => {
    try {
      let offset = parseInt(req.query.offset) || 0;
      let limit = parseInt(req.query.limit);
      let query = req.query;
      let sort = req.query.sort;
      let orderby = req.query.orderby;
      const sortObject = {};
      let criteria = [];
      console.log("query", query);
      if (query.search && query.search.length > 0) {
        criteria.push({
          $expr: {
            $regexMatch: {
              input: { $toString: { $toLong: "$serviceCharge" } },
              regex: query.search,
            },
          },
        });
        criteria.push({
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$taxCharges" } },
                regex: query.search,
              },
            },
          });
          criteria.push({
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$pickupPerKmCharge" } },
                regex: query.search,
              },
            },
          });
          criteria.push({
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$deliveryDayCharges" } },
                regex: query.search,
              },
            },
          });
          criteria.push({
            $expr: {
              $regexMatch: {
                input: { $toString: { $toLong: "$deliveryBoyDistanceKm" } },
                regex: query.search,
              },
            },
          });
      }
      criteria = criteria.length > 0 ? { $or: criteria } : {};
      sortObject[sort] = orderby === "asc" ? 1 : -1;
      const users = await Charges
        .find(criteria)
        .sort(sortObject)
        .skip(offset * limit)
        .limit(limit);
      const total = await Charges.countDocuments(criteria);
      const response = {
        error: false,
        total,
        offset: offset + 1,
        limit,
        users,
      };
      console.log(response);
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
    }
  };


module.exports = {createExtraCharges,updateExtraCharges,getExtraCharges };
