const nodemailer =require("nodemailer");
var fs=require('fs');
var htmlstream = fs.createReadStream("email.html");
const transporter = nodemailer.createTransport({
    // host: "sandbox.smtp.mailtrap.io",
    // port: 2525,
    // host: 'smtp.gmail.com',
    // port: 587,
    // secure: false,
    service: 'gmail',
    auth: {
      // user: "ff674d8f3304cc",
      // pass: "f61a2a365a53f6"
      user: "rachita_salaria@inclusionsoft.com",
      pass: "jdnnnyqiyydvcntw"
    },
    logger: true
  });


  const sendmailtouser = (orderDetails) => {
    console.log('orderDetails',orderDetails)
    var orderItems = orderDetails.item
    console.log('2444444',orderItems);
    for(let i=0;i<orderItems.length;i++){
  var itemname= orderItems[i].name
  console.log('itemname',itemname)
  var item_id = orderItems[i]._id
  var Quantity = orderItems[i].amount
  var singlePrice = orderItems[i].price
  var totalitemPrice = orderItems[i].amount * orderItems[i].price
  var rows = orderItems.map((item) =>
  `<tr >

  <td style="color: #000000;
  font-size: 13px;
  font-weight: normal;
  padding: 8px;text-align: center;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;">
  <img src="https://api.smartworkindia7.com/${item.imagePath}" style="
  height: 30px;
  width: 30px;
  object-fit: cover;"></img></td>                                
  <td style="color: #000000;
  font-size: 13px;
  font-weight: normal;
  padding: 8px;text-align: center;
  border-bottom: 1px solid #ddd;">${item._id}</td>
  <td style="color: #000000;
  font-size: 13px;
  font-weight: normal;
  padding: 8px;text-align: center;
  border-bottom: 1px solid #ddd;">${item.name}</td>
  <td style="color: #000000;
  font-size: 13px;
  font-weight: normal;
  padding: 8px;text-align: center;
  border-bottom: 1px solid #ddd;">${item.amount}</td>                                
  <td style="color: #000000;
  font-size: 13px;
  font-weight: normal;
  padding: 8px;text-align: center;
  border-bottom: 1px solid #ddd;">${item.basePrice}</td>
  <td style="color: #000000;
  font-size: 13px;
  font-weight: normal;
  padding: 8px;text-align: center;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;">${item.price }</td>
</tr>`).join('');
    }
    // localStorage.setItem('orderDetails',user)
      let mainOptions = {
        from: 'rachita_salaria@inclusionsoft.com',
        to: 'rachita_salaria@inclusionsoft.com',
        subject: 'Order confirmed',
        html: `<html>

        <body
            style="background-color:#e2e1e0;font-family: Open Sans, sans-serif;font-size:100%;font-weight:400;line-height:1.4;color:#000;">
            <table
                style="max-width:670px;margin:50px auto 10px;background-color:#fff;padding:15px;-webkit-border-radius:3px;-moz-border-radius:3px;border-radius:3px;-webkit-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);-moz-box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24);box-shadow:0 1px 3px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.24); border-top: solid 10px #ff7722;">
                <thead>
                    <tr>
                        <th colspan="100%" style="text-align:left;">
                            <img src="https://smartworkindia7.com/assets/img/logo.png" style="    width: 170px;
                            margin-bottom: 15px;">
                        </th>
                    </tr>
                    <tr>
                        <th colspan="100%" style="text-align:left;">Dear ${orderDetails.name}</th>
                        <!-- <th style="text-align:left;font-weight:400;">Your order has been recevied and now being processed. your  order details are shown  below for your reference.</th> -->
                    </tr>
        
                    <tr>
                        <!-- <th style="text-align:left;">Dear User</th> -->
                        <th colspan="100%" style="text-align:left;font-weight:400;">Your order has been recevied and now being
                            processed. your  order details are shown  below for your reference.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="height:35px;"></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="border: solid 1px #ddd; padding:10px 20px;">
                            <p style="font-size:14px;margin:0 0 6px 0;"><span
                                    style="font-weight:bold;display:inline-block;min-width:150px">Order status</span><b
                                    style="color:green;font-weight:normal;margin:0">${orderDetails.statusbar}</b></p>
                            <p style="font-size:14px;margin:0 0 6px 0;"><span
                                    style="font-weight:bold;display:inline-block;min-width:146px">Order ID</span> ${orderDetails._id}
                            </p>
                            <p style="font-size:14px;margin:0 0 0 0;"><span
                                    style="font-weight:bold;display:inline-block;min-width:146px">Total order amount</span> ₹
                                ${orderDetails.totalAmount}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:35px;"></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size:20px;padding:30px 15px 0 15px;">Delivery Address</td>
                    </tr>
                    <tr>
                        <td style="width:50%;padding:20px;vertical-align:top">
                            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                                    style="display:block;font-weight:bold;font-size:13px">Name</span>${orderDetails.address[0].firstname}</p>
                            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                                    style="display:block;font-weight:bold;font-size:13px;">Email</span>${orderDetails.email}</p>
                            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                                    style="display:block;font-weight:bold;font-size:13px;">Phone</span>${orderDetails.phone}</p>
                           
                        </td>
                        <td style="width:50%;padding:20px;vertical-align:top">
                            <p style="margin:0 0 10px 0;padding:0;font-size:14px;"><span
                                    style="display:block;font-weight:bold;font-size:13px;">Address</span>${orderDetails.address[0].streetAddress},
                                ${orderDetails.address[0].city}, ${orderDetails.address[0].state},${orderDetails.address[0].pin}</p>
                         
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size:20px;padding:30px 15px 0 15px;">Items</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="padding:15px;">
                            <table style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th style="background-color: #ff7722;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: normal;
                                        padding: 8px;">Item Image</th>
                                        
                                        <th style="background-color: #ff7722;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: normal;
                                        padding: 8px;">Item Id</th>
                                        <th style="background-color: #ff7722;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: normal;
                                        padding: 8px;">Item Name</th>
                                        <th style="background-color: #ff7722;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: normal;
                                        padding: 8px;">Quantity</th>                                
                                        <th style="background-color: #ff7722;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: normal;
                                        padding: 8px;">Single Item Price</th>
                                        <th style="background-color: #ff7722;
                                        color: #fff;
                                        font-size: 13px;
                                        font-weight: normal;
                                        padding: 8px;">Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>      
                                      ${rows}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="100%" style="padding: 0px 15px 0px 15px;">
        
                            <!-- Table Total -->
                            <table border="0" cellpadding="0" cellspacing="0" align="center" style="float: right;">
                                <tbody>
                                    <tr>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                                            Subtotal
                                        </td>
                                        <td style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; white-space:nowrap;"
                                            width="80">
                                            ₹${orderDetails.totalPrice}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                                            Service Charge:
                                        </td>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                                            ₹${orderDetails.serviceCharge}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                                            Delivery Charge:
                                        </td>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #646a6e; line-height: 22px; vertical-align: top; text-align:right; ">
                                            ₹${orderDetails.deliveryCharge}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #b0b0b0; line-height: 22px; vertical-align: top; text-align:right; ">
                                            <small>TAX</small>
                                        </td>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #b0b0b0; line-height: 22px; vertical-align: top; text-align:right; ">
                                            <small>₹${orderDetails.tax}</small>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #000; line-height: 22px; vertical-align: top; text-align:right; ">
                                            <strong>Grand Total (Incl.Tax)</strong>
                                        </td>
                                        <td
                                            style="font-size: 13px; font-family: 'Open Sans', sans-serif; color: #000; line-height: 22px; vertical-align: top; text-align:right; ">
                                            <strong>₹${orderDetails.totalAmount}</strong>
                                        </td>
                                    </tr>
                                    
                                </tbody>
                            </table>
                            <!-- /Table Total -->
        
                        </td>
                    </tr>
                </tbody>
                <tfooter>
                    <tr>
                        <td colspan="2" style="font-size:14px;padding:50px 15px 0 15px;">
                            <strong style="display:block;margin:0 0 10px 0;">Regards</strong> Team Swork7<br> 
                            <!-- Gorubathan,
                            Pin/Zip - 735221, Darjeeling, West bengal, India<br><br> -->
                            <b>Phone:</b> 9914915948<br>
                            <b>Email:</b> smartworkindia7@gmail.com
                        </td>
                    </tr>
                </tfooter>
            </table>
        </body>
        
        </html>`, 
        // attachments: [
        //   { 
        //       filename: 'invoice.pdf',
        //       path: 'C:/Users/inclu/swork-be/shopImage/1672230808357.jpeg'
        //   }
        // ]
      }
      transporter.sendMail(mainOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("infoooooooooooooo",info)
          console.log(`mail send ${info.response}`);
        }
      })
    }



    const sendmailtoShopUser = (useremail) => {
      console.log('useremail',useremail)
        let mainOptions = {
          from: 'rachita_salaria@inclusionsoft.com',
          to: 'rachitasalaria2000@gmail.com',
          subject: 'Test Email Subject',
          html: '<h1>Order Successful!!!</h1>'
        }
        transporter.sendMail(mainOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("infoooooooooooooo",info)
            console.log(`mail send ${info.response}`);
          }
        })
      }


      const sendMail = () => {
        console.log('maillll')
          let mainOptions = {
            from: 'rachitasalaia@gmail.com',
            to: 'rachitasalaia2000@gmail.com',
            subject: 'Test Email Subject',
            html: '<h1>Order Successful!!!</h1>'
          }
          transporter.sendMail(mainOptions, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log("infoooooooooooooo",info)
              console.log(`mail send ${info.response}`);
            }
          })
        }
  module.exports={sendMail,sendmailtouser,sendmailtoShopUser}