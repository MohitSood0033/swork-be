require("dotenv").config();
require("../../db/connection");
const express = require("express");
const cors = require('cors');
const ShopProduct = require("../../model/shopProduct");
const ShopUser = require("../../model/shopUser");
const app = express();
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
// FOR RESOVLE THE CORS ERROR
app.use(cors())

// Create a shopProduct

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let token = req.headers["x-access-token"];
      let decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const id = decoded.id;
      const destinationPath = `./ShopProductImage/${id}`;
      fs.mkdirSync(destinationPath, { recursive: true });
      cb(null, destinationPath);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        Date.now() + path.extname(file.originalname)
      );
    },
  });
  

const createShopProduct = async (req, res) => {
    try {
        const upload = multer({ storage }).single("file");
      let token = req.headers["x-access-token"];
      let decoded = await jwt.verify(token, process.env.TOKEN_KEY);
      const id = decoded.id;
      upload(req, res, async (err) => {
        if (err) {
          console.error("An error occurred:", err);
          return res.status(500).send("Error uploading the image.");
        }
        const fileName = req.file.filename;
        const { name, price, quantity, category, description } = req.body;
        if (!(name && quantity && price)) {
          return res.status(400).send("All input is required");
        }
        const getUser = await ShopUser.findOne({ _id: id });
        const shop = getUser.shop;
        const resizedFilePath = `./ShopProductImage/${id}/resized_${fileName + "." + req.file.mimetype.split("/")[1]}`;
        await sharp(req.file.path)
          .resize(100, 100)
          .jpeg({ quality: 50 })
          .toFile(resizedFilePath);
        fs.unlinkSync(req.file.path);
        const shopProduct = await ShopProduct.create({
          name,
          price,
          basePrice: price,
          quantity,
          category,
          description,
          shop,
          user: getUser,
          imagePath: resizedFilePath,
        });
        if (shopProduct) {
          return res.status(201).json({
            message: "Product added successfully",
            shopProduct,
          });
        } else {
          return res.status(409).send({ message: "Something went wrong" });
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  };

//get Shop product details
const getShopProduct = async (req, res) => {
    try {
        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.find({ _id: { $eq: id } })
        if (getUser !== null) {
            const getShopProduct = await ShopProduct.find({ user: { $eq: id } })
            return res.status(200).json({getShopProduct})
        }
        if (!getUser) {
            return res.status(400).json({ message: "Product not Exist" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}
//  get shop product by shop id
const getShopProductById=async (req,res)=>{
    console.log('shop_idddd',req.body.shop_id)
    console.log(req.body)
    try{
        const {shopUser_id,shop_id}=req.body
const getProduct=await ShopProduct.find({$and:[
    {user:shopUser_id},{shop:shop_id}
]})
console.log('gfdhfgdhfgdhfdhfg',getProduct)
if(getProduct!==null){
    res.status(200).json(getProduct)
}

    }catch(err){
        console.log(err);
    }
}








//update Shop product

const updateShopProduct = async (req, res) => {
    try {
        const { name, description,image, quantity, price } = req.body;

        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.findOne({ _id: { $eq: id } })
        const getShopProduct = await ShopProduct.findOne({ _id: { $eq: getUser._id } })
        const updateShopProduct = await ShopProduct.updateOne({ _id: { $eq: getShopProduct._id } }, {
            $set: {
                name: name,
                price: price,
                quantity: quantity,
                description:description
            }
        }, { new: true })
        if (updateShopProduct.modifiedCount) {
            res.status(200).json({ message: "Your ShopProduct has been updated successfully",updateShopProduct });
        }
        else {
            res.status(400).send("User Update Failed");
        }

    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}

const updateShopProductStatus = async (req, res) => {
    try {
        const { status, p_id} = req.body;

        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.findOne({ _id: { $eq: id } })
        const updateShopProduct = await ShopProduct.updateOne({ _id:  p_id }, {
            $set: {
                status: status,                
            }
        }, { new: true })
        if (updateShopProduct.modifiedCount) {
            res.status(200).json({ message: "Your ShopProductStatus has been updated successfully" });
        }
        else {
            res.status(400).json({message:"ShopProductStatus Update Failed"});
        }

    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}


const deleteShopProduct = async (req, res) => {
    try {
        const {p_id}=req.body

        let token = req.headers['x-access-token']
        let decoded = jwt.verify(token, process.env.TOKEN_KEY);
        let id = decoded.id
        const getUser = await ShopUser.findOne({ _id: { $eq: id } })
        const getShopProduct = await ShopProduct.find({ phone: { $eq: getUser.phone} })

        const deleteShopProduct = await ShopProduct.deleteOne({ _id: p_id})

        if (deleteShopProduct) {
            res.status(200).json({ message: "ShopProduct deleted successfully" })
        }
        else {
            res.status(400).send("ShopProduct delete failed")

        }
    } catch (error) {
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}

module.exports = { createShopProduct, getShopProduct, updateShopProduct, deleteShopProduct, updateShopProductStatus ,getShopProductById}

