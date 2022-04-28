/*
const supertest = require('supertest');
const express = require('express');
const router = require('../routes/customer.routes');
*/
const customerController = require('../controllers/customer.controller');
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
        const req = { body: {
                                "username": "test_user_1",
                                "password": "dummy_password",
                                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                                "latitude": 28.53538174,
                                "longitude": 77.19692286,
                                "mobile": 9999999999,
                                "email": "test_user_1@test.com"
                            } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await customerController.register(req,res,next);
        // console.log(res.result)
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
        expect(res.result.rowCount === 1);
    }),
    it('[T-1] Register failure - Duplicate username', async () => {
        const req = { body: {
                        "username": "test_user_1",
                        "password": "dummy_password",
                        "address": "84, Near Honda Showroom, Adchini, New Delhi",
                        "latitude": 28.53538174,
                        "longitude": 77.19692286,
                        "mobile": 9999999999,
                        "email": "test_user_1@test.com"
                    } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await customerController.register(req,res,next)
        expect(res.result.severity === "ERROR");
        expect(res.result.detail === 'Key (username)=(test_user_1) already exists.');
    })
    afterAll(async ()=>{
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_1"]);
        await db.terminate();
    })
});