/*
const supertest = require('supertest');
const express = require('express');
const router = require('../routes/customer.routes');
*/
const deliveryController = require('../controllers/delivery.controller');
const db = require('../db');
const pgp = require('pg-promise');
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

describe('Delivery Routes test suite',() => {
    beforeAll(async () => {
        db.init()
    })
    it('[T-0] Register Success',async () => {
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_3"]);
        // console.log(trial);
        const req = { 
                        body: {
                                "username": "test_user_3",
                                "password": "dummy_password",
                                "vaccination_status": '2',
                                "mobile": 9999999999,
                                "email": "test_user_1@test.com"
                            } 
                    }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await deliveryController.register(req,res,next);
        // console.log(res.result)
        user = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_3"]).catch(e=>e).then(x=>x.rows[0]);
        // console.log(user)
        // console.log(pgp.as.format("INSERT INTO food_order (order_id,customer_id,order_place_time,latitude,longitude) VALUES (1,$1,'2019-03-01 10:00+5:30',28.53538174,77.19692286);",[user.user_id]))
        expect(res.result.result.rowCount).toBe(1);
    }),
    it('[T-1] Register failure - Duplicate username', async () => {
        const req = { body: {
                        "username": "test_user_3",
                        "password": "dummy_password",
                        "vaccination_status": '2',
                        "mobile": 9999999999,
                        "email": "test_user_1@test.com"
                    } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await deliveryController.register(req,res,next)
        expect(res.result.result.severity).toBe("ERROR");
        expect(res.result.result.detail).toBe('Key (username)=(test_user_3) already exists.');
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
        await deliveryController.update(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await deliveryController.availability(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user = user;
        req.user.role = 'RESTAURANT';
        await deliveryController.update(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await deliveryController.availability(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user.role = 'DELIVERY';
        req.user.valid = false;
        await deliveryController.update(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await deliveryController.availability(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
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
        // console.log(req)
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await deliveryController.update(req,res,next);
        let temp = await db.query('SELECT mobile_no, email FROM delivery WHERE delivery_id = $1;',[user.user_id]);
        expect(res.result.result.rowCount).toBe(1);
        expect(temp.rows[0].mobile_no).toBe(9999999990);
        expect(temp.rows[0].email).toBe("stupid_email@idiot.com");
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
        await deliveryController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM delivery WHERE delivery_id = $1;',[user.user_id]);
        expect(res.result.result.rowCount).toBe(1);
        expect(temp.rows[0].mobile_no).toBe(9999999990);
        expect(temp.rows[0].email).toBe("new_stupid@stupid.com");
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
        await deliveryController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM delivery WHERE delivery_id = $1;',[user.user_id]);
        expect(res.result.result.rowCount).toBe(1);
        expect(temp.rows[0].mobile_no).toBe(9990999999);
        expect(temp.rows[0].email).toBe("new_stupid@stupid.com");
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
        await deliveryController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM delivery WHERE delivery_id = $1;',[user.user_id]);
        expect(res.result.result.rowCount).toBe(1);
        expect(temp.rows[0].mobile_no).toBe(9990999999);
        expect(temp.rows[0].email).toBe("new_stupid@stupid.com");
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
        await deliveryController.update(req,res,next);
        // console.log(res);
        expect(res.result.rowCount).toBe(0)
        user.user_id = user_id;
    })
    it('[T-8] Update - Availability', async () => {
        let req = {
            body: {
                "available": false
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await deliveryController.availability(req,res,next);
        // console.log(res)
        expect(res.result.result.rowCount).toBe(1)
    })
    afterAll(async ()=>{
        await db.query('DELETE FROM gen_user WHERE username = $1;', ["test_user_3"]);
        await db.terminate();
    })
});