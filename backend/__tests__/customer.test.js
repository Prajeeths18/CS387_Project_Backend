/*
const supertest = require('supertest');
const express = require('express');
const router = require('../routes/customer.routes');
*/
const customerModel = require('../models/customer.register');
const db = require('../db');
// const bodyParser = require('body-parser');
/*
const app = new express();
app.use('/', router);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
function clientErrorHandler (err, req, res, next) {
  if (req.xhr) {
     res.status(500).send({ error: 'Something failed!' })
   } else {
     next(err)
  }
}
app.use(clientErrorHandler);
*/
describe('Customer Routes test suite',() => {
    it('[T-0] Register Success',async () => {
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_1"]);
        // console.log(trial);
        const res = await customerModel.register("test_user_1","dummy_password","84, Near Honda Showroom, Adchini, New Delhi",28.53538174,77.19692286,9999999999,"test_user_1@test.com")
        // const res = await supertest(app)
                            // .post('/api/customer/register')
                            // .type('json')
                            // .send({
                            //     "username": "test_user_1",
                            //     "password": "dummy_password",
                            //     "address": "84, Near Honda Showroom, Adchini, New Delhi",
                            //     "latitude": 28.53538174,
                            //     "longitude": 77.19692286,
                            //     "mobile": 9999999999,
                            //     "email": "test_user_1@test.com"
                            // })
                            // .set('Accept','application/json');
        expect(res.rowCount === 1);
    }),
    it('[T-1] Register failure - Duplicate username', async () => {
        const res = await customerModel.register("test_user_1","dummy_password","84, Near Honda Showroom, Adchini, New Delhi",28.53538174,77.19692286,9999999999,"test_user_1@test.com")
        expect(res.severity === "ERROR");
        expect(res.detail === 'Key (username)=(test_user_1) already exists.');
    })
    afterAll(async ()=>{
        await db.terminate();
    })
});