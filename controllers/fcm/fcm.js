
var admin = require("firebase-admin");
var serviceAccount = require('../../privateKey.json') //put the generated private key path here    

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://stellar-perigee-363215.firebaseio.com"
});

const fcm = async (token,title,body) => {
  console.log('tokennnn',token)
console.log("111111111111111");

const registrationToken = token;
console.log('registrationToken',registrationToken)

const payload = { 
   notification : {
      title : title,
      body : body,
      content_available : "true",
      image:"../../assets/s-work7-logo-11.png"
   },
   "data": {title:title},
}
console.log(13,payload);

const options = {
  priority: "high"
}
console.log('registrationToken',registrationToken)
  admin.messaging().sendToDevice(registrationToken, payload,options)
    .then(function (response) {
        console.log('rrrrrrrrrrrr',response);
    //   res.send('message succesfully sent !')
    })
    .catch(function (error) {
        console.log('eroorrrr',error);
    //   res.send(error).status(500)
    });





}





const fc1m = async (req, res) => {
    // var fcm = new FCM(serverKey)
    // const { token } = req.body
    // var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    //     to: token,
    //     collapse_key: "New_Message",

    //     notification: {
    //         title: 'Title of your push notification',
    //         body: 'Body of your push notification',
    //         // tag: "New Message",
    //         // icon: 'ic_notification',
    //         // color: '#18d821',
    //         // sound: 'default',
    //     },

    //     data: {  //you can send only notification or only data(or include both)
    //         my_key: 'my value',
    //         my_another_key: 'my another value'
    //     }
    // }

    // fcm.send(message, function (err, response) {
    //     if (err) {
    //         console.log("Something has gone wrong!")
    //         console.log(err);
    //     } else {
    //         console.log("Successfully sent with response: ", response)
    //     }
    // })
}

module.exports = { fcm }
