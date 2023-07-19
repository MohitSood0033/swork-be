const mongoose = require("mongoose");
const moment = require("moment");

const SubscriptionSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  shopUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShopUser",
    require: true,
  },
  planFee: { type: String },
  subscriptionDate: { type: String, default: null },
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
module.exports = Subscription;
