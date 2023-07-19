const mongoose = require("mongoose");
const moment = require('moment');


const DeliveryAddressSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,

  firstname: { type: String, default: null },
  lastname: { type: String, default: null },
  streetAddress:{ type: String, default: null },
  city:{ type: String, default: null },
  state:{type: String, default: null},
  pin:{type: Number,default:null},
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
},
{ timestamps: {currentTime: () => moment.utc().format()} });
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
// });
const DeliveryAddress = mongoose.model("DeliveryAddress", DeliveryAddressSchema);
module.exports = DeliveryAddress;