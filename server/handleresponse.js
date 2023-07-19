var ccav = require("./ccavutil.js");
const Order = require("../model/order.js")
qs = require("querystring");
exports.ccavres = function (req, res) {
  let ccavEncResponse = "",
    ccavResponse = "",
    workingKey = "6054D9B0843ED83D9D7563CB1AF123FD", //Put in the 32-Bit key shared by CCAvenues. TESTING 3010
    accessCode = "AVMR64KE72AY64RMYA", //Put in the Access Code shared by CCAvenues. TESTING 3010
    ccavPOST = "";

  req.on("data", function (data) {
    ccavEncResponse += data;
    console.log("ccavEncResponse", ccavEncResponse);
    ccavPOST = qs.parse(ccavEncResponse);
    var encryption = ccavPOST.encResp;
    ccavResponse = ccav.decrypt(encryption, workingKey);
    // Response is decrypted
  });

  req.on("end", function () {
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
      // DO YOUR STUFF redirect to failure url and update failure status to database
      res.writeHead(301, { Location: "http://localhost:3010/failed" });
      res.end();
    } else if (output.order_status === "Success") {
      try {
        const getShopOrderStatus = Order.findOne({ _id: output.order_id });
        console.log("getShopOrderStatus", getShopOrderStatus);

        console.log("sssss", req.body.x);
        const updateShopOrderStatus = Order.updateOne(
          { _id: output.order_id },
          {
            $set: {
              statusbar: "Confirmed",
              paymentStatus: 2,
            },
          },
          { new: true }
        );
        if (updateShopOrderStatus.modifiedCount) {
          console.log("id", id);
          res
            .status(200)
            .json({
              message: " ShopOrderStatus has updated successfully",
              id: id,
            });
        } else {
          res.status(400).send("ShopOrderStatus Update Failed");
        }
      } catch (err) {
        res.status(400).send(err);
        console.log(err);
      }
      // DO YOUR STUFF redirect to success url and update success status to database
      res.writeHead(301, { Location: "http://localhost:8100/home2" });
      res.end();
    }
  });
};
