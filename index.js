const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const bodyParser=require("body-parser")
const router= require("./routes/routes")
const adminRoutes=require('./routes/adminRoutes')

var loopback = require('loopback');
var boot = require('loopback-boot');

var app2 = module.exports = loopback();

app.use(bodyParser.json())

// route
app.use(router)
console.log("hello!!!!!!!!!!!!!!");
app.use(adminRoutes)
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;


//---------------------- payment gateway --------------------------
var ccavresponsehandler = require('./server/handleresponse');
app.post('/handleresponse', function (request, response){
  console.log('request11111111', request)
  ccavresponsehandler.ccavres(request, response);
});

//---------------------- payment gateway --------------------------

// app2.start = function() {
//   // start the web server
//   return app2.listen(function() {
//     app2.emit('started');
//     var baseUrl = app2.get('url').replace(/\/$/, '');
//     console.log('Web server listening at: %s', baseUrl);
//     if (app2.get('loopback-component-explorer')) {
//       var explorerPath = app2.get('loopback-component-explorer').mountPath;
//       console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
//     }
//   });
// };

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app2, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  // if (require.main === module)
  //   app2.start();
});




server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  module.exports = app;