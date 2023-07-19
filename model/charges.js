const mongoose = require("mongoose");
const ChargesSchema = new mongoose.Schema({
  serviceCharge: { type: Number },
  taxCharges: { type: Number },
  deliveryDayCharges: { type: Number },
  pickupPerKmCharge: { type: Number },
  deliveryBoyDistanceKm: { type: Number },
});

const Charges = mongoose.model("Charges", ChargesSchema);
module.exports = Charges;
