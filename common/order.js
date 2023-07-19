"use strict";
var ccav = require("./ccavutil.js");
const Order = require("../model/order.js");
const customer = require("../model/customer.js");
const ShopUser = require("../model/shopUser.js");
const subscription = require("../model/subscriptionPlan.js");
var mongoose = require("mongoose");
const Fcm = require("../controllers/fcm/fcm.js");
var ccavresponsehandler = require("../server/handleresponse.js");
const app = require("../app.js");
const bodyParser = require("body-parser");
const sendMail = require("../mail/mail.js");

app.use(bodyParser.json());

// module.exports = function(Order) {

//     Order.encryptFormData = function (request, cb) {
//       console.log('start')
//         var formBody = '';
//         var workingKey = 'F3AB7893256327BAA998AB7D413A62F6';	//Put in the 32-Bit key shared by CCAvenues.TESTING 3010
//         var accessCode = 'AVUC04KF98BE37CUEB';	//Put in the Access Code shared by CCAvenues. TESTING 3010
//         var encRequest = '';
//         encRequest = ccav.encrypt(request, workingKey);
//         cb(null, encRequest);
//       }

//       Order.remoteMethod('encryptFormData', {
//         accepts: {
//           arg: 'request',
//           type: 'any'
//         },
//         returns: {
//           arg: 'response',
//           type: 'any'
//         },
//         http: {
//           path: '/encryptFormData',
//           verb: 'get'
//         }
//       });

const encryptFormData = function (request, response) {
  console.log("start");
  var formBody = "";
  var workingKey = "6054D9B0843ED83D9D7563CB1AF123FD"; //Put in the 32-Bit key shared by CCAvenues.TESTING 3010
  var accessCode = "AVMR64KE72AY64RMYA"; //Put in the Access Code shared by CCAvenues. TESTING 3010
  var encRequest = "";
  encRequest = ccav.encrypt(request, workingKey);
  return response.send({
    response: encRequest,
  });
  // console.log()

  // resolve(encRequest);

  //   return new Promise(function resolution(resolve, reject, {
  //     // async things
  //     resolve(encRequest)
  // }
  //   ))
};

const handleresponse = async function (request, res) {
  console.log("request11111111", request.body.encResp);
  // console.log('rrrrrrrrrrrrrrrrrrr',req)
  let workingKey = "6054D9B0843ED83D9D7563CB1AF123FD",
    //Put in the 32-Bit key shared by CCAvenues. TESTING 3010
    accessCode = "AVMR64KE72AY64RMYA"; //Put in the Access Code shared by CCAvenues. TESTING 3010

  var encryption = request.body.encResp;
  let ccavResponse = ccav.decrypt(encryption, workingKey);

  const stringify = JSON.stringify(ccavResponse.split("&"))
    .replace(/['"]+/g, "")
    .replace(/[[\]]/g, "");
  console.log(stringify);
  let output = stringify.split(",").reduce(function (o, pair) {
    pair = pair.split("=");
    return (o[pair[0]] = pair[1]), o;
  }, {});

  console.log("output.order_id", output.order_id);

  // The 'output' variable is the CCAvenue Response in JSON Format
  if (output.order_status === "Failure") {
    console.log("output.order_id", output.order_id);
    console.log(typeof output.order_id);
    let id = output.order_id;
    console.log("iiiiiiiiiiiiiiiiiii", id);
    const getShopOrderStatus = await Order.findOne({ _id: id });
    console.log("getShopOrderStatus", getShopOrderStatus);
    const updateShopOrderStatus = await Order.updateOne(
      { _id: id },
      {
        $set: {
          statusbar: "Cancelled",
        },
      },
      { new: true }
    );
    if (updateShopOrderStatus) {
      console.log("status cancelled is update");
    }
    console.log("redirect to home page");
    return res.sendFile(__dirname + "/failure.html");
  } else if (output.order_status === "Success") {
    console.log("output.order_id", output.order_id);
    console.log(typeof output.order_id);
    let id = output.order_id;
    console.log("iiiiiiiiiiiiiiiiiii", id);
    const getShopOrderStatus = await Order.findOne({ _id: id });
    console.log("getShopOrderStatusssss", getShopOrderStatus);
    console.log(
      "getShopOrderStatusssss customerid",
      getShopOrderStatus.customer
    );
    var cuid = getShopOrderStatus.customer;
    var suid = getShopOrderStatus.itemShopId;
    const getcustomer = await customer.findOne({ _id: cuid });

    console.log("getcustomerStatus", getcustomer);
    console.log("getcustomer token", getcustomer.deviceToken);
    
    const getShopUser = await ShopUser.findOne({ _id: suid });
    console.log("getShopUser", getShopUser);
    console.log("getShopUser token", getShopUser.deviceToken);
    // console.log("getShopUser token", getShopUser[0].deviceToken);


    // console.log("sssss", req.body.x);
    const updateShopOrderStatus = await Order.updateOne(
      { _id: id },
      {
        $set: {
          statusbar: "Confirmed",
          paymentStatus: 2,
        },
      },
      { new: true }
    );
    if (updateShopOrderStatus) {
      // sendMail.sendMail();
      console.log("cuid", cuid);
      let title = "Order Placed";
      let body = "Your Order has been Placed ";
      let title1 = "Get Order ";
      let body1 = "Your get new Order  ";
      console.log("device tokennnnnnn", getcustomer.deviceToken);
      console.log("deviceeeee token", getcustomer.deviceToken);
      if (getShopUser.deviceToken !== null || undefined) {
        console.log("shopUser.deviceToken", getShopUser.deviceToken);
        Fcm.fcm(getShopUser.deviceToken, title1, body1);
      }
      if (getcustomer.deviceToken !== null || undefined) {
        console.log("customer.deviceToken", getcustomer.deviceToken);
        Fcm.fcm(getcustomer.deviceToken, title, body);
      }
      // console.log("idddddddddddddd", id);
      console.log("status is update");
    }
    console.log("redirect to home page");
    console.log(__dirname + "/success.html", "pathhhhh");
    return res.sendFile(__dirname + "/success.html");
  } else if (output.order_status === "Aborted") {
    console.log("output.order_id", output.order_id);
    console.log(typeof output.order_id);
    let id = output.order_id;
    console.log("iiiiiiiiiiiiiiiiiii", id);
    const getShopOrderStatus = await Order.findOne({ _id: id });
    console.log("getShopOrderStatus", getShopOrderStatus);
    // console.log("sssss", req.body.x);
    const updateShopOrderStatus = await Order.updateOne(
      { _id: id },
      {
        $set: {
          statusbar: "Cancelled",
        },
      },
      { new: true }
    );
    if (updateShopOrderStatus) {
      // console.log("idddddddddddddd", id);
      console.log("status cancelled is update");
    }
    console.log("redirect to home page");
    return res.sendFile(__dirname + "/cancel.html");
  }
  // res.end();
};

const handleSubscriptionResponse = async function (request, res) {
  console.log("request11111111", request.body.encResp);
  // console.log('rrrrrrrrrrrrrrrrrrr',req)
  let workingKey = "6054D9B0843ED83D9D7563CB1AF123FD",
    //Put in the 32-Bit key shared by CCAvenues. TESTING 3010
    accessCode = "AVMR64KE72AY64RMYA"; //Put in the Access Code shared by CCAvenues. TESTING 3010

  var encryption = request.body.encResp;
  let ccavResponse = ccav.decrypt(encryption, workingKey);

  const stringify = JSON.stringify(ccavResponse.split("&"))
    .replace(/['"]+/g, "")
    .replace(/[[\]]/g, "");
  console.log(stringify);
  let output = stringify.split(",").reduce(function (o, pair) {
    pair = pair.split("=");
    return (o[pair[0]] = pair[1]), o;
  }, {});

  console.log("output.order_id", output.order_id);

  // The 'output' variable is the CCAvenue Response in JSON Format
  if (output.order_status === "Failure") {
    console.log("output.order_id", output.order_id);
    console.log(typeof output.order_id);
    console.log("redirect to home page");

    // DO YOUR STUFF redirect to failure url and update failure status to database
    return res.sendFile(__dirname + "/failure.html");
  } else if (output.order_status === "Success") {
    console.log("output.order_id", output.order_id);
    console.log(typeof output.order_id);
    let id = output.order_id;
    console.log("iiiiiiiiiiiiiiiiiii", id);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 19);
    const oldSubscriptionPlan = await subscription.findOne({ shopUserId: id });
    if (oldSubscriptionPlan) {
      const subscriptionPlanTime = await subscription.updateOne(
        { shopUserId: id },
        {
          $set: {
            subscriptionDate: formattedDate,
          },
        },
        { new: true }
      );
      console.log(subscriptionPlanTime);
    } else {
      const subscriptionPlan = await subscription.create({
        shopUserId: id,
        planFee: output.amount,
        subscriptionDate: formattedDate,
      });
      console.log(subscriptionPlan);
    }
    const getShopUser = await ShopUser.findOne({ _id: id });
    console.log("getShopUser", getShopUser);
    const updateShopUser = await ShopUser.updateOne(
      { _id: id },
      {
        $set: {
          status: 2,
        },
      },
      { new: true }
    );
    if (updateShopUser) {
      console.log("status is update");
    }
    console.log("redirect to home page");

    console.log(__dirname + "/.html", "pathhhhh");
    return res.sendFile(__dirname + "/subscriptionSuccess.html");
  } else if (output.order_status === "Aborted") {
    console.log("output.order_id", output.order_id);
    console.log(typeof output.order_id);
    let id = output.order_id;
    console.log("redirect to home page");
    return res.sendFile(__dirname + "/cancel.html");
  }
};

// ccavresponsehandler.ccavres(request, response

module.exports = {
  encryptFormData,
  handleresponse,
  handleSubscriptionResponse,
};
