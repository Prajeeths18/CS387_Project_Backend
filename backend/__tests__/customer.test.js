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

let user;

describe('Customer Routes test suite',() => {
    beforeAll(async () => {
        await db.query('INSERT INTO gen_user (username,password,role,valid) VALUES (test_restaurant,useless_password,"RESTAURANT",true');
    })
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
        user = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_1"]).catch(e=>e).then(x=>x.rows[0]);
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
    it('[T-2] Update - Invalid auth', async () => {
        let req = {
            body: {
                "mobile": 9999999990,
                "email": "stupid_email@idiot.com"
            }
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.update(req,res,next);
        expect(res.status === 500);
        expect(res.result === null);
        req.user = user;
        req.user.role = 'RESTAURANT';
        await customerController.update(req,res,next);
        expect(res.status === 500);
        expect(res.result === null);
        req.user.role = 'CUSTOMER';
        req.user.valid = false;
        await customerController.update(req,res,next);
        expect(res.status === 500);
        expect(res.result === null);
        req.user.valid = true;
    })
    it('[T-3] Update - Full Success',async () => {
        let req = {
            body: {
                "mobile": 9999999990,
                "email": "stupid_email@idiot.com"
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.update(req,res,next);
        let temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
        expect(res.result.rowCount === 1);
        expect(temp.rows[0].mobile_no === 9999999990);
        expect(temp.rows[0].email === "stupid_email@idiot.com");
    })
    it('[T-4] Update - Missing Mobile Success',async () => {
        let req = {
            body: {
                "mobile": 9999999990,
                "email": "stupid_email@idiot.com"
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        req.body.mobile = undefined;
        req.body.email = "new_stupid@stupid.com"
        await customerController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
        expect(res.result.rowCount === 1);
        expect(temp.rows[0].mobile_no === 9999999990);
        expect(temp.rows[0].email === "new_stupid@stupid.com");
    })
    it('[T-5] Update - Missing email Success',async () => {
        let req = {
            body: {
                "mobile": 9999999990,
                "email": "stupid_email@idiot.com"
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        req.body.mobile = 9990999999;
        req.body.email = undefined;
        await customerController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
        expect(res.result.rowCount === 1);
        expect(temp.rows[0].mobile_no === 9990999999);
        expect(temp.rows[0].email === "new_stupid@stupid.com");
    })
    it('[T-6] Update - Empty Success',async () => {
        let req = {
            body: {
                "mobile": 9999999990,
                "email": "stupid_email@idiot.com"
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        req.body.mobile = undefined;
        req.body.email = undefined;
        await customerController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
        expect(res.result.rowCount === 1);
        expect(temp.rows[0].mobile_no === 9990999999);
        expect(temp.rows[0].email === "new_stupid@stupid.com");
    })
    it('[T-7] Update - Missing customer', async () => {
        let req = {
            body: {
                "mobile": 9999999990,
                "email": "stupid_email@idiot.com"
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        let user_id = req.user.user_id;
        req.user.user_id = -1;
        await customerController.update(req,res,next);
        expect(res.result.rowCount === 0)
        user.user_id = user_id;
    }) 
    it('[T-8] Delete address Success', async () => {
        let req = {
            body: {
                "latitude": 28.53538174,
                "longitude": 77.19692286,
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.delete_address(req,res,next);
        expect(res.result.rowCount === 1);
    });
    it('[T-9] Add new address Success', async () => {
        let req = {
            body: {
                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                "latitude": 28.53538174,
                "longitude": 77.19692286,
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.add_address(req,res,next);
        expect(res.result.rowCount === 1);
    })
    it('[T-10] Update address Success', async () => {
        let req = {
            body: {
                "old_latitude": 28.53538174,
                "old_longitude": 77.19692286,
                "address": "81/3, 1st Floor, Qutub Residency, Adchini, New Delhi",
                "latitude": 28.53549308,
                "longitude": 77.19747473
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.update_address(req,res,next);
        expect(res.result.result[0].rowCount === 1)
        expect(res.result.result[1].rowCount === 0)
        expect(res.result.result[2].rowCount === 1)
    })
    afterAll(async ()=>{
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_1"]);
        await db.terminate();
    })
});