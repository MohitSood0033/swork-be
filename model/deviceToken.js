const mongoose = require("mongoose");

const DeviceTokenSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  deviceToken: { type: Object },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
});

const DeviceToken = mongoose.model("DeviceToken", DeviceTokenSchema);
module.exports = DeviceToken;