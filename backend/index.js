require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
const dummyRoute = require("./routes/dummy.routes");
const customerRoute = require("./routes/customer.routes");
const authRoute = require("./routes/auth.routes");
const restRoute = require("./routes/restaurant.routes");
const deliveryRoute = require("./routes/delivery.routes");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", dummyRoute);
app.use("/api/customer/", customerRoute);
app.use("/", authRoute);
app.use("/api/restaurant/",restRoute);
app.use("/api/delivery/",deliveryRoute);
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
     res.status(500).send({ error: 'Something failed!' })
   } else {
     next(err)
  }
}
app.use(clientErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
