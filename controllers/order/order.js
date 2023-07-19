require("dotenv").config();
require("../../db/connection");
const express = require("express");
const cors = require("cors");
const ProductOrder = require("../../model/order");
const ShopUser = require("../../model/shopUser");
const User = require("../../model/user");
const ShopProduct = require("../../model/shopProduct");
const Order = require("../../model/order");
const jwt = require("jsonwebtoken");
const sendMail = require("../../mail/mail");
const Customer = require("../../model/customer");
const Service = require("../../model/service");
const orderPayment = require("../../model/orderPayment");
const Employee = require("../../model/employee");
const app = express();
const Fcm = require("../fcm/fcm.js");
const { title } = require("process");
app.use(express.json({ limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors());
const moment = require("moment");
const { get } = require("request");
const datetime = moment().format("MMMM Do YYYY, h:mm:ss a");

// Create a shopProduct

const createOrder = async (req, res) => {
  console.log("reqqqqqqqqqqqqqqqqqqqqqqqqqq", req.body);
  console.log("adresssss", req.body.address);
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    console.log(id);
    // Get user input
    const {
      name,
      phone,
      email,
      item,
      orderItemPrice,
      totalPrice,
      totalProduct,
      serviceCharge,
      tax,
      deliveryCharge,
      totalAmount,
      address,
      location,
      product,
      su_id,
      itemShopId,
      pickupCharges,
    } = req.body;

    // Validate user input
    // console.log(req.body);
    // check if user already exist
    // Validate if user exist in our database
    // console.log(orderItemPrice);
    console.log("cusrtomer id", req.body.cu_id);
    const customer = await Customer.find({ _id: { $eq: req.body.cu_id } });
    // console.log('ccccccustomerr',customer)
    // console.log('ccccccustomerr token',customer[0].deviceToken)
    console.log("itemShopId", itemShopId);
    const shopUser = await ShopUser.find({ _id: { $in: itemShopId } });
    console.log("1111", shopUser);
    const shopUserIds = shopUser.map((user) => user._id);
    console.log("ssssssssssssssssssssss", shopUserIds);
    // console.log('tokennnnnn',shopUser.deviceToken)

    // console.log('shopUser token',shopUser[0].deviceToken)
    // Create order in our database
    const productOrder = await ProductOrder.create({
      name: name,
      phone: phone,
      email: email,
      item: item,
      orderItemPrice: orderItemPrice,
      totalPrice: totalPrice,
      totalProduct: totalProduct,
      serviceCharge: serviceCharge,
      tax: tax,
      deliveryCharge: deliveryCharge,
      totalAmount: totalAmount,
      address: address,
      location: { coordinates: location },
      shopProduct: product,
      shopUser: shopUserIds,
      customer: id,
      shopAddress: shopUser.geo_address,
      itemShopId: itemShopId,
      pickupCharges: pickupCharges,
    });
    console.log("pppppppppppppppppppp", productOrder);
    // sendMail.sendmailtouser(productOrder);
    let title = "You Get Order";
    let body = name + " " + "order at" + " " + datetime;
    // if(shopUser.deviceToken!==null||undefined){
    //   console.log('shopUser.deviceToken',shopUser.deviceToken)
    // Fcm.fcm(shopUser.deviceToken, title)
    // }
    // if(shopUser.deviceToken!==null||undefined){
    //   console.log('customer.deviceToken',shopUser.deviceToken)
    // Fcm.fcm(shopUser.deviceToken, title,body)
    // }
    return res
      .status(201)
      .json({ message: "Order add Successfully", productOrder });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
const getOrderByPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const getOrder = await ProductOrder.find({
      $and: [{ phone: phone }],
    });
    if (getOrder !== null) {
      res.status(200).json(getOrder);
    }
  } catch (err) {
    console.log(err);
  }
};
const getOrderById = async (req, res) => {
  try {
    const { su_id } = req.body;
    const getOrder = await ShopProduct.find({
      $and: [
        {
          _id: su_id,
        },
      ],
    });
    console.log();
    if (getOrder !== null) {
      res.status(200).json(getOrder);
    }
    if (getOrder == null) {
      return res.status(400).json("product not exist");
    }
  } catch (err) {
    console.log(err);
  }
};

const getOrderByDBId = async (req, res) => {
  try {
    const { dB_id } = req.body;
    console.log(req.body)
    const getOrder = await Order.find({ acceptDeliveryBoy: { $eq: dB_id } });
    console.log('gettt',getOrder);
    if (getOrder !== null) {
      res.status(200).json(getOrder);
    }
    if (getOrder == null) {
      return res.status(400).json("order not exist");
    }
  } catch (err) {
    console.log(err);
  }
};


// const getOrderByDBId = async (req, res) => {
//   try {
//     // const { deliveryBoy } = req.body;
//     let token = req.headers["x-access-token"];
//     let decoded = jwt.verify(token, process.env.TOKEN_KEY);
//     let id = decoded.id;
//     console.log('ooooo'),id
//     const getOrder =await Order.find({ acceptDeliveryBoy: { $eq: req.body.dB_id } });
//     console.log("getOrder",getOrder)
//     if (getOrder !== null) {
//       return res.status(200).json(getOrder);
//     } else {
//       return res.status(400).json({ menubar: "didn't find any order" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };

// for order details with auth user

const getAuthOrderById = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    console.log(req.body);
    const getOrder = await Order.find({
      $and: [{ shopUser: req.body.shopid }],
    });
    // for(let i=0;i<getOrder.length;i++){
    //     var itemId = getOrder[i].item
    // }

    // console.log(itemId);
    // const shopProduct = await ShopProduct.find({ $and: [{ _id: itemId }] });
    // for(let i=0;i<getOrder.length;i++){
    //     getOrder[i].orderItemList.push(shopProduct);
    // }

    console.log(getOrder);
    if (getOrder !== null) {
      res.status(200).json({ getOrder });
    }
    if (getOrder == null) {
      return res.status(400).json("Order not exist");
    }
  } catch (err) {
    console.log(err);
  }
};

// For update the order status by shopUser
const updateShopOrderStatus = async (req, res) => {
  try {
    const { status, o_id } = req.body;

    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getUser = await ShopUser.findOne({ _id: { $eq: id } });
    const updateShopOrder = await ProductOrder.updateOne(
      { _id: o_id },
      {
        $set: {
          o_id: o_id,
          status: status,
        },
      },
      { new: true }
    );
    let getShopOrder = await ProductOrder.findOne({ _id: { $eq: o_id } });

    let statusbar;
    if (getShopOrder.status == 0) {
      statusbar = "Canceled";
    }
    if (getShopOrder.status == 1) {
      statusbar = "Pending";
    }
    if (getShopOrder.status == 2) {
      statusbar = "Confirmed";
    }
    if (getShopOrder.status == 3) {
      statusbar = "Ready to Deliver";
    }
    if (getShopOrder.status == 4) {
      statusbar = "Out for Deliver";
    }
    if (getShopOrder.status == 5) {
      statusbar = "Ready to Pickup";
    }
    if (getShopOrder.status == 6) {
      statusbar = "Delivered";
    }
    const updateShopOrderNew = await ProductOrder.updateOne(
      { _id: o_id },
      {
        $set: {
          statusbar: statusbar,
        },
      },
      { new: true }
    );
    getShopOrder = await ProductOrder.findOne({ _id: { $eq: o_id } });
    console.log("getShopOrder", getShopOrder);
    console.log("getShopOrderalldeliveryboys", getShopOrder.AlldeliveryBoy);
    const getRequesteddeliveryboy = await User.find({
      _id: { $in: getShopOrder.AlldeliveryBoy },
    });

    const getCustomer = await Customer.find({
      _id: { $eq: getShopOrder.customer },
    });
    console.log("ccccccustomerr", getCustomer);
    console.log("ccccccustomerr token", getCustomer[0].deviceToken);
    // console.log('shopiddd',getShopOrder.shopUser)
    const getShopUser = await ShopUser.find({
      _id: { $in: getShopOrder.shopUser },
    });
    console.log("getShopUserrrrrrr", getShopUser[0].deviceToken);
    var arrshopandcust = []
    arrshopandcust.push(getCustomer[0].deviceToken,getShopUser[0].deviceToken);
    console.log("arrshopandcust",arrshopandcust)
    
    var resarrarrshopandcust = arrshopandcust.filter(elements => {
      return (elements != null && elements !== undefined && elements !== "" &&  Object.keys(elements).length !== 0);
     });
    console.log("resarrrequestdeliverytoken", resarrarrshopandcust);
    // console.log("getShopUser token", getShopUser[0].deviceToken);

    // const getCustomer= await Customer.findOne({_id:getShopOrder.customer}) || await ShopUser.findOne({_id:getShopOrder.customer})
    // || await User.findOne({_id:getShopOrder.customer}) || await Employee.findOne({_id:getShopOrder.customer})
    // let shopUser=await ShopUser.findOne({_id:getShopOrder.shopUser})
    // console.log('243 243 243',getShopOrder);

    // if (getShopOrder.statusbar == "Canceled" && getCustomer.deviceToken!==undefined||null||'') {
    //   let devicetoken = getCustomer.deviceToken
    //   let title = "Your order Canceled by " + getShopOrder.getUser.firstname + " at  " + datetime
    //   Fcm.fcm(devicetoken, title)
    // }

    // if (getShopOrder.statusbar == "Ready to Deliver" && shopUser.deviceToken!==undefined||null||'') {
    //   let devicetoken = shopUser.deviceToken
    //   let title = "Your order is ready for delivery " + getShopOrder.getUser.firstname + " at  " + datetime
    //   Fcm.fcm(devicetoken, title)
    // }
    if (updateShopOrderNew) {
      if (
        (getShopOrder.statusbar == "Ready to Deliver" &&
          getCustomer[0].deviceToken !== null) ||
        undefined
      ) {
        let title = "Ready to Deliver";
        let body = "Order has been Ready to Deliver";
        console.log("customer.deviceToken", getCustomer[0].deviceToken);
        Fcm.fcm(getCustomer[0].deviceToken, title, body);
      }
      if (
        (getShopOrder.statusbar == "Out for Deliver" &&
          getCustomer[0].deviceToken !== null) ||
        undefined
      ) {
        let title = "Out for Deliver ";
        let body = "Order has been Out for Deliver ";
        console.log("customer.deviceToken", getCustomer[0].deviceToken);
        Fcm.fcm(getCustomer[0].deviceToken, title, body);
      }

      if (
        (getShopOrder.statusbar == "Ready to Pickup" &&
          getCustomer[0].deviceToken !== null) ||
        undefined
      ) {
        let title = "Ready to Pickup";
        let body = "Order has been Ready to Pickup";
        console.log("customer.deviceToken", getCustomer[0].deviceToken);
        Fcm.fcm(getCustomer[0].deviceToken, title, body);
      }

      if (getShopOrder.statusbar == "Delivered" && resarrarrshopandcust.length!==0) {
        console.log('ddddd')
        let devicetoken = getCustomer[0].deviceToken;
        let title = "Delivered";
        let body = "Order has been Delivered";
        Fcm.fcm(resarrarrshopandcust, title, body);
        // Fcm.fcm(getShopUser[0].deviceToken, title, body);
      }

      // if (
      //   (getShopOrder.statusbar == "Delivered" &&
      //     getShopUser[0].deviceToken !== null) ||
      //   undefined
      // ) {
      //   let title = "Delivered";
      //   let body = "Order has been Delivered";
      //   Fcm.fcm(getShopUser[0].deviceToken, title, body);
      // }
      res.status(200).json({
        message: "Your ShopOrderStatus has been updated successfully",
      });
    } else {
      res.status(400).json({ message: "ShopProductStatus Update Failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};
// update delivery Status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryStatus, o_id } = req.body;
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getShoporder = await ProductOrder.findOne({ _id: { $eq: o_id } });
    console.log("getShoporder",getShoporder)
    const getacceptdeliveryboy = await User.findOne({
      _id: { $eq: getShoporder.acceptDeliveryBoy },
    });
    console.log("getacceptdeliveryboy", getacceptdeliveryboy);

    const getShopUser = await ShopUser.find({
      _id: { $in: getShoporder.shopUser },
    });
    console.log("getShopUser",getShopUser)
    console.log("getShopUserrrrrrr", getShopUser[0].deviceToken);

    // let devicetoken = getShopOrder.shopUser.deviceToken
    // let title = "Your order successfully delivered to " + getShopOrder.name + " at  " + datetime
    // Fcm.fcm(devicetoken, title)

    const updateShopOrderNew = await Order.updateOne(
      { _id: o_id },
      {
        $set: {
          deliveryStatus: deliveryStatus,
        },
      },
      { new: true }
    );
    if (updateShopOrderNew) {
      console.log('ttttt',getShopUser[0].deviceToken)
      if (getShopUser[0].deviceToken !== null ||undefined) 
       {
        let title = "Accept Order";
        let body =
          "Order Request has been Accept by" +
          getacceptdeliveryboy.firstname +
          " at  " +
          datetime;
        // let body = "Order Request has been Accept by Deliver";
        console.log("shop.deviceToken", getShopUser[0].deviceToken);
        Fcm.fcm(getShopUser[0].deviceToken, title, body);
      }

      res.status(200).json({
        message: "Your Delivery Status has been updated successfully",
      });
    } else {
      res.status(400).json({ message: "Delivery Status Update Failed" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};
// get order product =====================

const getOrderProduct = async (req, res) => {
  try {
    const { op_id } = req.body;

    const getOrderProduct = await ShopProduct.find({
      $and: [
        {
          _id: { $in: op_id },
        },
      ],
    });
    if (getOrderProduct !== null) {
      res.status(200).json(getOrderProduct);
    }
    if (getOrderProduct == null) {
      return res.status(400).json({ message: "Order Product not exist" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Update order Product===============================================

const updateShopOrder = async (req, res) => {
  try {
    const { o_id, item, totalPrice } = req.body;

    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getUser = await ShopUser.findOne({ _id: { $eq: id } });
    const updateShopOrder = await ProductOrder.updateOne(
      { _id: o_id },
      {
        $set: {
          //rest of code
          item: item,
          totalPrice: totalPrice,
        },
      },
      { new: true }
    );
    if (updateShopOrder) {
      res
        .status(200)
        .json({ message: "Your ShopOrder has been updated successfully" });
      // sendMail.sendMail();
    } else {
      res.status(400).json({ message: "ShopProduct Update Failed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong", error });
  }
};

// Order payment create history
const createPaymentOrder = async (req, res) => {
  console.log(req.body);
  const { status, response, usertype, orderId } = req.body;

  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const serviceUser = await User.findOne({ _id: { $eq: id } });
  const shopUser = await ShopUser.findOne({ _id: { $eq: id } });
  const customerUser = await Customer.findOne({ _id: { $eq: id } });

  if (serviceUser) {
    const paymentHistory = await orderPayment.create({
      paymentStatus: status,
      response: response,
      user: serviceUser,
      usertype: usertype,
    });
    const updateOrder = await Order.updateOne(
      { _id: { $eq: orderId } },
      {
        $set: {
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateOrder) {
      return res
        .status(200)
        .json({ message: "Your order status has updated successfully" });
    }
    return res.status(201).json({ paymentHistory });
  }

  if (shopUser) {
    const paymentHistory = await orderPayment.create({
      paymentStatus: status,
      response: response,
      user: shopUser,
      usertype: usertype,
    });
    const updateUser = await Order.updateOne(
      { _id: { $eq: orderId } },
      {
        $set: {
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateUser) {
      return res
        .status(200)
        .json({ message: "Your order status has updated successfully" });
    }
    return res.status(201).json({ paymentHistory });
  }
  if (customerUser) {
    const paymentHistory = await orderPayment.create({
      paymentStatus: status,
      response: response,
      user: customerUser,
      usertype: usertype,
    });
    const updateUser = await Order.updateOne(
      { _id: { $eq: orderId } },
      {
        $set: {
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateUser) {
      return res
        .status(200)
        .json({ message: "Your order status has updated successfully" });
    }
    return res.status(201).json({ paymentHistory });
  }
};
// get nearest delivery boy for order

const deliveryProviderUser = async (req, res) => {
  console.log("requestttttttt", req.body);
  let service = "Delivery Boy";
  console.log("requesttt", req.body);
  const { lat, lng } = req.body;
  let longitude = req.body.lng;
  let latitude = req.body.lat;

  let getservice = await Service.find({
    name: { $eq: service },
  });

  console.log("service", getservice);
  let service_id = getservice[0]._id;

  try {
    console.log("service_id", getservice[0]._id);
    let getUser = await User.find({
      $and: [
        {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [latitude, longitude],
              },
              $maxDistance: parseInt(req.body.deliveryBoyDistanceKm),
              // maximum distance in meters
            },
          },
        },
        { service: service_id },
      ],
    });
    console.log("getttttuseeee", getUser);
    res.status(200).json(getUser);
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
};

// const deliveryProviderUser = async (req, res) => {

//   console.log('requesttt', req.body);
//   const { lat, lng } = req.body;
//   let longitude = req.body.lng;
//   let latitude = req.body.lat;

//   try {
//     let getUsers = await User.find({

//       location: {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [latitude,longitude],
//           },
//           $maxDistance: 5000,
//           // maximum distance in meters
//         },
//       },
//     })
// console.log('near delivery boyss',getUsers)
//     res.status(200).json(getUsers);
//   } catch (e) {
//     console.log(e);
//     res.status(500).json(e.message);
//   }
// };

const getOrderForCustomer = async (req, res) => {
  console.log(req.body);
  let token = req.headers["x-access-token"];
  let decoded = jwt.verify(token, process.env.TOKEN_KEY);
  let id = decoded.id;
  const getUser1 = await User.findOne({ _id: { $eq: id } });
  let phone;
  if (getUser1) {
    phone = getUser1.phone;
  }
  const getUser2 = await ShopUser.findOne({ _id: { $eq: id } });
  if (getUser2) {
    phone = getUser2.phone;
  }
  const getUser3 = await Customer.findOne({ _id: { $eq: id } });
  if (getUser3) {
    phone = getUser3.phone;
  }
  let getOrder = await Order.find({
    // $and: [{ phone: phone }, { paymentStatus: 2 }],
    $and: [{ phone: phone }],
  });
  console.log(id);

  if (getOrder) {
    return res.status(200).json({ getOrder: getOrder });
  } else {
    return res.status(400).json({ meassge: "Order Not Found" });
  }
};

//  add deliveryBoy in order by shop user
const addDeliveryBoy = async (req, res) => {
  console.log("eeeeeeeeeeeeeeeeeeeee", req.body);
  const getRequesteddeliveryboy = await User.find({
    _id: { $in: req.body.deliveryBoy },
  });
  // console.log("getRequesteddeliveryboy",getRequesteddeliveryboy)
  const order = await ProductOrder.find({
    _id: { $eq: req.body.itemid },
  });
  console.log("order",order)
  // console.log("getRequesteddeliveryboy", getRequesteddeliveryboy);
  var arrrequestdeliverytoken = [];
  for (let i = 0; i < getRequesteddeliveryboy.length; i++) {
    // console.log(getRequesteddeliveryboy[i].deviceToken);
    arrrequestdeliverytoken.push(getRequesteddeliveryboy[i].deviceToken);
  }
  var resarrrequestdeliverytoken = arrrequestdeliverytoken.filter(elements => {
    return (elements != null && elements !== undefined && elements !== "" &&  Object.keys(elements).length !== 0);
   });
  console.log("resarrrequestdeliverytoken", resarrrequestdeliverytoken);
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const addDeliveryBoy = await Order.updateOne(
      // { shopUser: { $eq: id } }
      { _id: { $eq: req.body.itemid } },
      {
        $set: {
          AlldeliveryBoy: req.body.deliveryBoy,
        },
      },
      { new: true }
    );
    console.log(addDeliveryBoy);
    if (addDeliveryBoy) {
      console.log('vvvv')
      console.log(order.statusbar,resarrrequestdeliverytoken.length)
      if ( resarrrequestdeliverytoken.length!==0 ){
        console.log('hhhhhh')
        let title = "Order Request";
        let body =
          "You have Order Request " ;

        console.log("delivery.deviceToken", resarrrequestdeliverytoken);
        Fcm.fcm(resarrrequestdeliverytoken, title, body);
      }

      return res
        .status(200)
        .json({ message: "Request send to near by delivery boy" });
    } else {
      return res
        .status(400)
        .json({ message: "Request send to near by delivery boy Failed!" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// order for deleveryBoy
const getOrderForDeliveryBoy = async (req, res) => {
  try {
    // const { deliveryBoy } = req.body;
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    const getOrder = await ProductOrder.find({
      $or: [
        { AlldeliveryBoy: id },{ statusbar: "Ready to Deliver" },
        { statusbar: "Out for Deliver" },
      ],
    });
    if (getOrder !== null) {
      return res.status(200).json(getOrder);
    } else {
      return res.status(400).json({ menubar: "didn't find any order" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// order accept by delivery body
const acceptOrderByDeliveryBoy = async (req, res) => {
  try {
    let token = req.headers["x-access-token"];
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    let id = decoded.id;
    console.log("iiii", id);
    const acceptOrderByDeliveryBoy = await Order.updateOne(
      // { AlldeliveryBoy: { $eq: id } },
      { _id: { $eq: req.body.ItemId } },
      {
        $set: {
          acceptDeliveryBoy: id,
        },
      },
      { new: true }
    );
    if (acceptOrderByDeliveryBoy) {
      return res.status(200).json({ message: "order accept by delivery boy" });
    } else {
      return res
        .status(400)
        .json({ message: "Order accept fail by delivery boy Failed!" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createOrder,
  getOrderByPhone,
  getOrderById,
  getOrderByDBId,
  getAuthOrderById,
  updateShopOrderStatus,
  getOrderProduct,
  updateShopOrder,
  createPaymentOrder,
  deliveryProviderUser,
  getOrderForCustomer,
  updateDeliveryStatus,
  addDeliveryBoy,
  getOrderForDeliveryBoy,
  acceptOrderByDeliveryBoy,
};
