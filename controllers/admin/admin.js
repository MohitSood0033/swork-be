require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const ShopUser = require("../../model/shopUser");
const User = require("../../model/user");
const Customer = require("../../model/customer");
const Employee = require("../../model/employee");
const Order = require("../../model/order");
const ShopProduct = require("../../model/shopProduct");
const shopUsersDoc = require("../../model/shopUsersDoc");
const serviceUsersDoc = require("../../model/serviceUsersDoc");
const payout = require("../../model/payoutRequest");
const Contactus = require("../../model/contactus");
const Fcm = require("../fcm/fcm.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());

// get admin
const getAdmin = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (decoded) {
      const getAdmin = await mongoose.connection.db
        .collection("admin")
        .find()
        .toArray();
      console.log(getAdmin);
      if (getAdmin) {
        return res.status(200).json(getAdmin[0]);
      } else {
        return res
          .status(400)
          .json({ message: "Admin Not exist please login first" });
      }
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//Shop user
const getShopUser = async (req, res) => {
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
      criteria.push({ firstname: { $regex: query.search, $options: "i" } });
      criteria.push({ lastname: { $regex: query.search, $options: "i" } });
      criteria.push({ email: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$phone" } },
            regex: query.search,
          },
        },
      });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await ShopUser.find(criteria)
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    const total = await ShopUser.countDocuments(criteria);
    const response = {
      error: false,
      total,
      offset: offset + 1,
      limit,
      users,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
};

const getShopUserDoc = async (req, res) => {
  try {
    let id = req.params.id;
    const getShopDoc = await shopUsersDoc.findOne({
      shopUserId: { $eq: id },
    });
    if (getShopDoc !== null) {
      return res.status(200).json({ getShopDoc });
    } else {
      return res.status(400).json({ message: "ShopDoc not Found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const getShopUserById = async (req, res) => {
  try {
    let id = req.params.id;
    const getShopUser = await ShopUser.findOne({
      _id: { $eq: id },
    });
    if (getShopUser !== null) {
      return res.status(200).json({ getShopUser });
    } else {
      return res.status(400).json({ message: "ShopUser not Found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const verifyShopUserDoc = async (req, res) => {
  console.log(req);
  const id = req.params.id;
  console.log("id", id);
  try {
    const verifyShopDoc = await shopUsersDoc.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: { isVerify: true },
      },
      { new: true }
    );
    if (verifyShopDoc) {
      return res.status(200).send({
        title: "shopUsersDoc verification successful",
        shopUsersDoc: verifyShopDoc,
      });
    } else {
      res
        .status(400)
        .send({ message: "shopUsersDoc verification unsuccessful" });
    }
  } catch (err) {
    return res.status(500).json({ message: "something went wrong" });
  }
};

const updateShopUser = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getShopUser = await ShopUser.findOne({ _id: req.params.id });
    console.log("user", getShopUser);
    const { firstname, lastname, email, phone } = req.body;
    const updateShopUser = await ShopUser.updateMany(
      { _id: req.params.id },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone,
        },
      },
      { new: true }
    );
    if (updateShopUser.modifiedCount) {
      console.log("firstname", firstname);
      console.log("id", id);
      res
        .status(200)
        .json({ message: " ShopUser has updated successfully", id: id });
    } else {
      res.status(400).send("User Update Failed");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};
const deleteShopUser = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getShopUser = await ShopUser.findOne({ _id: req.params.id });
    console.log("user", getShopUser);
    const deleteShopUser = await ShopUser.deleteOne({ _id: req.params.id });
    if (deleteShopUser) {
      res.status(200).json({ message: " ShopUser deleted successfully" });
    } else {
      res.status(400).send("not delete");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

//Service user
const getServiceUser = async (req, res) => {
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
      criteria.push({ firstname: { $regex: query.search, $options: "i" } });
      criteria.push({ lastname: { $regex: query.search, $options: "i" } });
      criteria.push({ email: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$phone" } },
            regex: query.search,
          },
        },
      });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await User.find(criteria)
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    console.log(users);
    const total = await User.countDocuments(criteria);
    const response = {
      error: false,
      total,
      offset: offset + 1,
      limit,
      users,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
};
const getServiceUserDoc = async (req, res) => {
  try {
    // let token = req.headers["x-access-token"];
    // let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = req.params.id;
    const getShopDoc = await serviceUsersDoc.findOne({
      serviceUserId: { $eq: id },
    });
    // console.log(getUser.service)
    // let ServiceId=getUser.service
    // const service=await Service.findOne({_id: {$eq:ServiceId}})
    // const ServiceName=service.name
    if (getShopDoc !== null) {
      return res.status(200).json({ getShopDoc });
    } else {
      return res.status(400).json({ message: "ShopDoc not Found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateServiceUser = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getServiceUser = await User.findOne({ _id: req.params.id });
    console.log("user", getServiceUser);
    const { firstname, lastname, email, phone } = req.body;
    const updateServiceUser = await User.updateMany(
      { _id: req.params.id },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone,
        },
      },
      { new: true }
    );
    if (updateServiceUser.modifiedCount) {
      console.log("firstname", firstname);
      console.log("id", id);
      res
        .status(200)
        .json({ message: " ServiceUser has updated successfully", id: id });
    } else {
      res.status(400).send("ServiceUser Update Failed");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

const deleteServiceUser = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getServiceUser = await User.findOne({ _id: req.params.id });
    console.log("user", getServiceUser);
    const deleteServiceUser = await User.deleteOne({ _id: req.params.id });
    if (deleteServiceUser) {
      res.status(200).json({ message: " ServiceUser deleted successfully" });
    } else {
      res.status(400).send("not delete");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

//Customer
const getCustomer = async (req, res) => {
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
      criteria.push({ firstname: { $regex: query.search, $options: "i" } });
      criteria.push({ lastname: { $regex: query.search, $options: "i" } });
      criteria.push({ email: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$phone" } },
            regex: query.search,
          },
        },
      });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await Customer.find(criteria)
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    const total = await Customer.countDocuments(criteria);
    const response = {
      error: false,
      total,
      offset: offset + 1,
      limit,
      users,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
};

const updateCustomer = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getCustomer = await Customer.findOne({ _id: req.params.id });
    console.log("user", getCustomer);
    const { firstname, lastname, email, phone } = req.body;
    const updateCustomer = await Customer.updateMany(
      { _id: req.params.id },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone,
        },
      },
      { new: true }
    );
    if (updateCustomer.modifiedCount) {
      console.log("firstname", firstname);
      console.log("id", id);
      res
        .status(200)
        .json({ message: " Customer has updated successfully", id: id });
    } else {
      res.status(400).send("Customer Update Failed");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

const deleteCustomer = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getCustomer = await Customer.findOne({ _id: req.params.id });
    console.log("getCustomer", getCustomer);
    const deleteCustomer = await Customer.deleteOne({ _id: req.params.id });
    if (deleteCustomer) {
      res.status(200).json({ message: " Customer deleted successfully" });
    } else {
      res.status(400).send("not delete");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};
//Employee
const getEmployee = async (req, res) => {
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
      criteria.push({ firstname: { $regex: query.search, $options: "i" } });
      criteria.push({ lastname: { $regex: query.search, $options: "i" } });
      criteria.push({ email: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$phone" } },
            regex: query.search,
          },
        },
      });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await Employee.find(criteria)
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    const total = await Employee.countDocuments(criteria);
    const response = {
      error: false,
      total,
      offset: offset + 1,
      limit,
      users,
    };
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
  }
};

const updateEmployee = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getEmployee = await Employee.findOne({ _id: req.params.id });
    console.log("getEmployee", getEmployee);
    const { firstname, lastname, email, phone } = req.body;
    const updateEmployee = await Employee.updateMany(
      { _id: req.params.id },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone,
        },
      },
      { new: true }
    );
    if (updateEmployee.modifiedCount) {
      console.log("firstname", firstname);
      console.log("id", id);
      res
        .status(200)
        .json({ message: " Employee has updated successfully", id: id });
    } else {
      res.status(400).send("Employee Update Failed");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

const deleteEmployee = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getEmployee = await Employee.findOne({ _id: req.params.id });
    console.log("getEmployee", getEmployee);
    const deleteEmployee = await Employee.deleteOne({ _id: req.params.id });
    if (deleteEmployee) {
      res.status(200).json({ message: " deleteEmployee deleted successfully" });
    } else {
      res.status(400).send("not delete");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

// order
const getShopOrder = async (req, res) => {
  try {
    let offset = parseInt(req.query.offset) || 0;
    let limit = parseInt(req.query.limit);
    let query = req.query;
    let sort = req.query.sort;
    let orderby = req.query.orderby;
    const sortObject = {};
    let criteria = [];
    // let criteria = [{ shopUser: { $eq: req.params.id } }];
    console.log("query", query);
    if (query.search && query.search.length > 0) {
      criteria.push({ name: { $regex: query.search, $options: "i" } });
      criteria.push({ email: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$phone" } },
            regex: query.search,
          },
        },
      });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$totalPrice" } },
            regex: query.search,
          },
        },
      });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$totalProduct" } },
            regex: query.search,
          },
        },
      });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await Order.find({
      $and: [{ shopUser: { $eq: req.params.id } }, criteria],
    })
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    console.log(users);
    const total = await Order.countDocuments({
      $and: [{ shopUser: { $eq: req.params.id } }, criteria],
    });
    const response = {
      error: false,
      total,
      offset: offset + 1,
      limit,
      users,
    };
    res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updateShopOrder = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getShopOrder = await Order.findOne({ _id: req.params.id });
    console.log("getShopOrder", getShopOrder);
    const { name, email, phone, totalPrice, totalProduct } = req.body;
    const updateShopOrder = await Order.updateMany(
      { _id: req.params.id },
      {
        $set: {
          name: name,
          email: email,
          phone: phone,
          totalPrice: totalPrice,
          totalProduct: totalProduct,
        },
      },
      { new: true }
    );
    if (updateShopOrder.modifiedCount) {
      console.log("id", id);
      res
        .status(200)
        .json({ message: " ShopOrder has updated successfully", id: id });
    } else {
      res.status(400).send("ShopOrder Update Failed");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

const deleteShopOrder = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getShopOrder = await Order.findOne({ _id: req.params.id });
    console.log("getShopOrder", getShopOrder);
    const deleteShopOrder = await Order.deleteOne({ _id: req.params.id });
    if (deleteShopOrder) {
      res.status(200).json({ message: " ShopOrder deleted successfully" });
    } else {
      res.status(400).send("not delete");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

const updateShopOrderStatus = async (req, res) => {
  const id = req.params.id;
  console.log("111111111111111111111", typeof id);
  console.log("id", id);
  console.log("reqqqbodyyy", req.body);
  console.log("xxxxxxxxxxxxx", req.body.x);
  console.log("xxxxxxxxxxxxx", req.body.cutomer_id);

  try {
    const customer = await Customer.find({ _id: { $eq: req.body.cutomer_id } });
    console.log("ccccccustomerr", customer);
    console.log("ccccccustomerr token", customer[0].deviceToken);
    const getShopOrderStatus = await Order.findOne({ _id: req.params.id });
    console.log("getShopOrderStatus", getShopOrderStatus);
    const { statusbar } = req.body.x;
    console.log("sssss", req.body.x);
    const updateShopOrderStatus = await Order.updateOne(
      { _id: req.params.id },
      {
        $set: {
          statusbar: req.body.x,
        },
      },
      { new: true }
    );
    if (updateShopOrderStatus.modifiedCount) {
      console.log("id", id);
      let title = "Order has been arrived";
      let body = "Your Order Status is" + " " + req.body.x;
      // if(shopUser.deviceToken!==null||undefined){
      //   console.log('shopUser.deviceToken',shopUser.deviceToken)
      // Fcm.fcm(shopUser.deviceToken, title)
      // }
      if (customer[0].deviceToken !== null || undefined) {
        console.log("customer.deviceToken", customer[0].deviceToken);
        Fcm.fcm(customer[0].deviceToken, title, body);
      }

      res
        .status(200)
        .json({ message: " ShopOrderStatus has updated successfully", id: id });
    } else {
      res.status(400).send("ShopOrderStatus Update Failed");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

//Product
const getShopProduct = async (req, res) => {
  try {
    let offset = parseInt(req.query.offset) || 0;
    let limit = parseInt(req.query.limit);
    let query = req.query;
    let sort = req.query.sort;
    let orderby = req.query.orderby;
    const sortObject = {};
    let criteria = [];
    // let criteria = [{ shopUser: { $eq: req.params.id } }];
    console.log("query", query);
    if (query.search && query.search.length > 0) {
      criteria.push({ name: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$price" } },
            regex: query.search,
          },
        },
      });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$basePrice" } },
            regex: query.search,
          },
        },
      });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$quantity" } },
            regex: query.search,
          },
        },
      });
      criteria.push({ description: { $regex: query.search, $options: "i" } });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await ShopProduct.find({
      $and: [{ user: { $eq: req.params.id } }, criteria],
    })
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    console.log(users);
    const total = await ShopProduct.countDocuments({
      $and: [{ user: { $eq: req.params.id } }, criteria],
    });
    const response = {
      error: false,
      total,
      offset: offset + 1,
      limit,
      users,
    };
    res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const destinationPath = `./ShopProductImage/admin_upload`;
    fs.mkdirSync(destinationPath, { recursive: true });
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const updateShopProduct = async (req, res) => {
  try {
    const upload = multer({ storage }).single("file");

    upload(req, res, async (err) => {
      if (err) {
        console.error("An error occurred:", err);
        return res.status(500).send("Error uploading the image.");
      }
      console.log('776',req.body)
      console.log('776',req.file)
      const fileName = req.file.filename;
      console.log(fileName);
      const getShopProduct = await ShopProduct.findOne({ _id: req.body.id });
      console.log("getShopProduct", getShopProduct);
      const resizedFilePath = `./ShopProductImage/${req.body.shopUserId}/resized_${
        fileName 
      }`;
      await sharp(req.file.path)
        .resize(100, 100)
        .jpeg({ quality: 50 })
        .toFile(resizedFilePath);
      fs.unlinkSync(req.file.path);
      const { name, price, basePrice, quantity, description } = req.body;
      const updateShopProduct = await ShopProduct.updateMany(
        { _id: req.body.id },
        {
          $set: {
            name: name,
            price: price,
            basePrice: basePrice,
            quantity: quantity,
            description: description,
            imagePath: resizedFilePath,
          },
        },
        { new: true }
      );
      if (updateShopProduct) {
        res
          .status(200)
          .json({ message: " ShopProduct has updated successfully", id: req.body.id });
      } else {
        res.status(400).send("ShopProduct Update Failed");
      }
    });
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

const deleteShopProduct = async (req, res) => {
  const id = req.params.id;
  console.log("id", id);
  try {
    const getShopProduct = await ShopProduct.findOne({ _id: req.params.id });
    console.log("getShopProduct", getShopProduct);
    const deleteShopProduct = await ShopProduct.deleteOne({
      _id: req.params.id,
    });
    if (deleteShopProduct) {
      res.status(200).json({ message: " ShopProduct deleted successfully" });
    } else {
      res.status(400).send("not delete");
    }
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};
// payment request
const getpayoutRequest = async (req, res) => {
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
      criteria.push({ shopUser: { $regex: query.search, $options: "i" } });
      criteria.push({
        $expr: {
          $regexMatch: {
            input: { $toString: { $toLong: "$amount" } },
            regex: query.search,
          },
        },
      });
    }
    criteria = criteria.length > 0 ? { $or: criteria } : {};
    //console.log('criteria',criteria);
    sortObject[sort] = orderby === "asc" ? 1 : -1;
    const users = await payout
      .find(criteria)
      .sort(sortObject)
      .skip(offset * limit)
      .limit(limit);
    const total = await payout.countDocuments(criteria);
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

  //   try{
  //    let token = req.headers["x-access-token"];
  //    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  //     let id = decoded.id;
  //     console.log(id);
  //     const payoutRequest= await payout.find(
  //        {
  //            $and:[

  //                {payoutRequestStatus:'unverified'}
  //            ]
  //        }
  //     )

  //     res.status(200).send(payoutRequest)}
  //     catch(e){
  //  console.log(e);
  //  res.status(500).json({message:"Something went wrong"})
  //     }
};

const updatepayoutRequest = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    // const id = decoded.id;
    // console.log(id);
    const { status, id ,userType,userId} = req.body;
    console.log(req.body);
    if(userType ==='services'){
      console
    var getserviceuser = await User.findOne({ _id: userId })
      console.log("getserviceuser",getserviceuser.deviceToken)
    }else{
      var getshopuser = await ShopUser.findOne({ _id: userId })
      console.log("getshopuser",getshopuser.deviceToken)
    }
    const updatePayoutRequest = await payout.updateOne(
      { _id: { $eq: id } },
      {
        $set: {
          payoutRequestStatus: status,
        },
      },
      { new: true }
    );
    if (updatePayoutRequest) {
    console.log("userType",userType)
      if(userType ==='services' && getserviceuser.deviceToken!==null){
         let title = "Withdrawn";
          let body = "your amount has been withdrawn";
          console.log("getserviceuser.deviceToken", getserviceuser.deviceToken);
          Fcm.fcm(getserviceuser.deviceToken, title, body);
      }else if(userType ==='shops' && getshopuser.deviceToken!==null){
        let title = "Withdrawn";
        let body = "your amount has been withdrawn";
        console.log("getshopuser.deviceToken", getshopuser.deviceToken);
        Fcm.fcm(getshopuser.deviceToken, title, body);
      }
      
      res
        .status(200)
        .json({ message: "PayoutRequest has updated successfully" });
    } else {
      res.status(400).send("PayoutRequest Update Failed");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
};



const updatedescriptionpayoutRequest = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    // const id = decoded.id;
    // console.log(id);
    const { Description, id } = req.body;
    console.log(req.body);

    const updatedescriptionpayoutRequest = await payout.updateOne(
      { _id: { $eq: id } },
      {
        $set: {
          description: Description,
        },
      },
      { new: true }
    );
    if (updatedescriptionpayoutRequest) {
      res
        .status(200)
        .json({ message: "PayoutRequest descriptionhas updated successfully" });
    } else {
      res.status(400).send("PayoutRequest descriptionhas Update Failed");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
};
// For contact us query
const contactus = async (req, res) => {
  const { name, phone, email, query } = req.body;
  if (!(name && phone && email && query)) {
    return res.status(400).json({ message: "All input is required" });
  } else {
    let contact = await Contactus.create({
      name: name,
      phone: phone,
      email: email,
      query: query,
    });
    if (contact) {
      res
        .status(201)
        .json({ contact, message: "Your query register successfully" });
    }
  }
};

//for total orders in dashboard

const totalOrders = async (req, res) => {
  // let status = req.query.status;
  let criteria = {};
  const totalcount = await Order.count(criteria);
  // const totalentries = await Data.count()
  if (totalcount != null || totalcount != undefined) {
    // console.log('countt',totalcount)
    return res.status(200).json(totalcount);
  } else res.status(404).send("err");
};

const totalOrdersPending = async (req, res) => {
  const totalPendingCount = await Order.find({ statusbar: "Pending" }).count();
  if (totalPendingCount != null || totalPendingCount != undefined) {
    // console.log('countt',totalPendingCount)
    return res.status(200).json(totalPendingCount);
  } else {
    console.log("errrrr");
    res.status(404).send("err");
  }
};

const totalOrdersConfirmed = async (req, res) => {
  const totalConfirmedCount = await Order.find({
    statusbar: "Confirmed",
  }).count();
  if (totalConfirmedCount != null || totalConfirmedCount != undefined) {
    // console.log('countt',totalConfirmedCount)
    return res.status(200).json(totalConfirmedCount);
  } else {
    console.log("errrrr");
    res.status(404).send("err");
  }
};

const totalOrdersCancelled = async (req, res) => {
  try {
    const totalCancelledCount = await Order.find({
      statusbar: "Cancelled",
    }).count();
    if (totalCancelledCount != null || totalCancelledCount != undefined) {
      console.log("countt", totalCancelledCount);
      return res.status(200).json(totalCancelledCount);
    } else {
      return;
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const totalOrdersDelivered = async (req, res) => {
  try {
    const totalDeliveredCount = await Order.find({
      statusbar: "Delivered",
    }).count();
    if (totalDeliveredCount != null || totalDeliveredCount != undefined) {
      console.log("countt", totalDeliveredCount);
      return res.status(200).json(totalDeliveredCount);
    } else {
      return;
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const totalOrdersPrice = async (req, res) => {
  // let status = req.query.status;
  let criteria = {};
  const totalcount = await Order.count(criteria);
  // const totalentries = await Data.count()
  if (totalcount != null || totalcount != undefined) {
    // console.log('countt',totalcount)
    return res.status(200).json(totalcount);
  } else res.status(404).send("err");
};

module.exports = {
  getAdmin,
  getShopUser,
  getShopUserDoc,
  getShopUserById,
  verifyShopUserDoc,
  updateShopUser,
  deleteShopUser,
  getServiceUser,
  getServiceUserDoc,
  updateServiceUser,
  deleteServiceUser,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  getShopOrder,
  updateShopOrder,
  updateShopOrderStatus,
  deleteShopOrder,
  getShopProduct,
  updateShopProduct,
  deleteShopProduct,
  getpayoutRequest,
  updatepayoutRequest,
  contactus,
  totalOrders,
  totalOrdersPending,
  totalOrdersConfirmed,
  totalOrdersCancelled,
  totalOrdersDelivered,
  updatedescriptionpayoutRequest
};
