const mongoose = require("mongoose");
const moment = require('moment');

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number]
  }
});

const DeliveryAddressSchema = new mongoose.Schema({

  phone:{type:Number,default:null,unique:true,require:true},
  firstname: { type: String, default: null },
  lastname: { type: String, default: null },
  streetAddress:{ type: String, default: null },
  city:{ type: String, default: null },
  state:{type: String, default: null},
  pin:{type: Number,default:null},

})

const orderSchema = new mongoose.Schema(
  {
    id: mongoose.Schema.Types.ObjectId,

    name: { type: String },
    phone: { type: Number },
    email: { type: String },
    item: [
      // {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "ShopProduct",
      //   require: true,
      //   multi: true,
      // },
    ],
    orderItemPrice: [],
    // orderItemList: [],
    totalPrice: { type: Number },
    totalProduct: { type: Number },
    serviceCharge:{type:Number},
    tax:{type:Number},
    deliveryCharge:{type:Number},
    totalAmount:{type:Number},
    shopProduct: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShopProduct",
        require: true,
        multi: true,
      },
    ],
    shopUser:[ {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopUser",
      require: true,
      multi: true,
    }],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
    },
    location: {
      type: geoSchema,
      index: "2dsphere",
    },
    address:{
      type: DeliveryAddressSchema,
      ref: "DeliveryAddress",
      require: true,
      multi: true,
      type:Array
    },
    status: { type: Number, default: 1 },
    paymentStatus: { type: Number, default: 1 },
    statusbar: { type: String, default: "Pending" },
    deliveryStatus:{type:String,default:"Ready for Packing"},
    AlldeliveryBoy:{type:Array,default:[]},
    acceptDeliveryBoy:{type:String,default:''},
    shopAddress:{type:String},
    itemShopId : [ 
        {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopUser",
      require: true,
      multi: true,
    },
  ],
  pickupCharges:{type:Number},
  },
  { timestamps: { currentTime: () => moment.utc().format() } }
);



const Order = mongoose.model("Order", orderSchema);
module.exports = Order