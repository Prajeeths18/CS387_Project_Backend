require('dotenv').config();
const express = require('express')
const app = express()
const port = 3000
const dummyRoute = require("./routes/dummy.routes");
const customerRoute = require("./routes/customer.routes");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", dummyRoute);
app.use("/", customerRoute);
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
