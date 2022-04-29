/*
const supertest = require('supertest');
const express = require('express');
const router = require('../routes/customer.routes');
*/
const customerController = require('../controllers/customer.controller');
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
let restaurant_id;
let delivery_id;

describe('Customer Routes test suite',() => {
    beforeAll(async () => {
        db.init()
        await db.query("INSERT INTO gen_user (username,password,role,valid) VALUES ('test_restaurant','useless_password','RESTAURANT',true);");
        restaurant_id = await db.query("SELECT user_id FROM gen_user WHERE username = 'test_restaurant';").then(x=>x.rows[0].user_id);
        await db.query("INSERT INTO restaurant (restaurant_id,restaurant_name,mobile_no,latitude,longitude) VALUES ($1,'test_restaurant',1234567890,28.53538174,77.19692286);",[restaurant_id]);
        await db.query("INSERT INTO food_type (food_name,food_type,course_type) VALUES ('test_food','VEG','STARTERS');");
        await db.query("INSERT INTO food_items (restaurant_id,food_name,available,preparation_time,specific_discount,cost) VALUES ($1,'test_food',true,5,0,150);",[restaurant_id])
        await db.query("INSERT INTO gen_user (username,password,role,valid) VALUES ('test_delivery','useless_password','DELIVERY',true);");
        delivery_id = await db.query("SELECT user_id FROM gen_user WHERE username = 'test_delivery';").then(x=>x.rows[0].user_id);
        await db.query("INSERT INTO delivery (delivery_id,mobile_no,vaccination_status) VALUES ($1,1234567890,'2');",[delivery_id]);
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
        // console.log(pgp.as.format("INSERT INTO food_order (order_id,customer_id,order_place_time,latitude,longitude) VALUES (1,$1,'2019-03-01 10:00+5:30',28.53538174,77.19692286);",[user.user_id]))
        // await db.query("INSERT INTO food_order (order_id,customer_id,order_place_time,latitude,longitude) VALUES (1,$1,'2019-03-01 10:00+5:30',28.53538174,77.19692286);",[user.user_id])
        // await db.query("INSERT INTO order_restaurant (order_id,customer_id,restaurant_id) VALUES (1,$1,$2);",[user.user_id,restaurant_id]);
        // await db.query("INSERT INTO order_has (order_id, customer_id, food_name, quantity) VALUES (1,$1,'test_food',2);",[user.user_id]);
        // await db.query("INSERT INTO order_taken (order_id,customer_id,delivery_id) VALUES (1,$1,$2);",[user.user_id,delivery_id]);
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
        // console.log(res.result.result)
        expect(res.result.result.rowCount).toBe(1);
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
        expect(res.result.result.severity).toBe("ERROR");
        expect(res.result.result.detail).toBe('Key (username)=(test_user_1) already exists.');
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
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.add_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.update_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.delete_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.delivery_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.food_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.restaurant_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user = user;
        req.user.role = 'RESTAURANT';
        await customerController.update(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.add_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.update_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.delete_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.delivery_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.food_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.restaurant_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user.role = 'CUSTOMER';
        req.user.valid = false;
        await customerController.update(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.add_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.update_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.delete_address(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.delivery_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.food_review(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await customerController.restaurant_review(req,res,next);
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
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.update(req,res,next);
        let temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
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
        await customerController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
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
        await customerController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
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
        await customerController.update(req,res,next);
        temp = await db.query('SELECT mobile_no, email FROM customer WHERE customer_id = $1;',[user.user_id]);
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
        await customerController.update(req,res,next);
        expect(res.result.rowCount).toBe(0)
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
        expect(res.result.result.rowCount).toBe(1);
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
        expect(res.result.result[1].rowCount).toBe(1);
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
        expect(res.result.result[0].rowCount).toBe(1)
        expect(res.result.result[1].rowCount).toBe(0)
        expect(res.result.result[2].rowCount).toBe(1)
    })
    it('[T-10] Place Order Success', async () => {
        let req = {
            body: {
                "restaurant_id": restaurant_id,
                "timestamp":"2019-06-21 10:00+5:30",
                "food_pairs":[["test_food",2]],
                "latitude": 28.53549308,
                "longitude": 77.19747473
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.order(req,res,next);
        expect(res.result.order_id).toBe(1)
        await db.query('UPDATE order_taken SET delivery_id=$1 WHERE customer_id=$2',[delivery_id,user.user_id])
    })
    it('[T-11] Add restaurant review', async () => {
        let req = {
            body: {
                "order_id": 1,
                "restaurant_id": restaurant_id,
                "rating": 3,
                "review": "random nonsense",
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.restaurant_review(req,res,next);
        expect(res.result.result.rowCount).toBe(1)
        let temp = await db.query("SELECT restaurant_rating, restaurant_review FROM order_restaurant WHERE order_id=1 AND customer_id=$1 AND restaurant_id=$2",[user.user_id,restaurant_id]);
        // console.log(temp)
        expect(temp.rows[0].restaurant_rating).toBe("3")
        expect(temp.rows[0].restaurant_review).toBe('random nonsense')
    })
    it('[T-11] Add food review', async () => {
        let req = {
            body: {
                "order_id": 1,
                "rating": 2,
                "review": "more random nonsense",
                "food_name": "test_food"
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.food_review(req,res,next);
        expect(res.result.result.rowCount).toBe(1)
        let temp = await db.query("SELECT food_rating, food_review FROM order_has WHERE order_id=1 AND customer_id=$1 AND food_name=$2",[user.user_id,"test_food"]);
        expect(temp.rows[0].food_rating).toBe("2")
        expect(temp.rows[0].food_review).toBe('more random nonsense')
    })
    it('[T-11] Add delivery review', async () => {
        let req = {
            body: {
                "order_id": 1,
                "rating": 4,
                "review": "more more random nonsense",
                "delivery_id": delivery_id
            },
            user: user
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.delivery_review(req,res,next);
        // console.log(res)
        expect(res.result.result.rowCount).toBe(1)
        let temp = await db.query("SELECT delivery_rating, delivery_review FROM order_taken WHERE order_id=1 AND customer_id=$1 AND delivery_id=$2;",[user.user_id,delivery_id]).catch(e=>e);
        // console.log(temp)
        expect(temp.rows[0].delivery_rating).toBe("4")
        expect(temp.rows[0].delivery_review).toBe('more more random nonsense')
    })

    it('[T-12] Get Restaurant List', async () => {
        let req = {
            body: {
                "latitude": 28.53538174,
                "longitude": 77.19692286,
            },
            user:user,
           
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await customerController.restaurant_list(req,res,next);
        //console.log(res)
        expect(res.result.result.rowCount).toBe(63);
        // res.result.result.rows.filter(e => {
        //     expect(e.distance).toBe
        // });
       //expect(res.result.result.rowCount).toBe(21)
        //let temp = await db.query("SELECT delivery_rating, delivery_review FROM order_taken WHERE order_id=1 AND customer_id=$1 AND delivery_id=$2;",[user.user_id,delivery_id]).catch(e=>e);
        // console.log(temp)
        //expect(temp.rows[0].delivery_rating).toBe("4")
        //expect(temp.rows[0].delivery_review).toBe('more more random nonsense')
    })

    afterAll(async ()=>{
        await db.query("DELETE FROM food_items WHERE food_name = $1;",['test_food']);
        await db.query("DELETE FROM food_type WHERE food_name = $1;",['test_food']);
        await db.query("DELETE FROM food_order WHERE customer_id = $1;",[user.user_id]);
        await db.query("DELETE FROM order_restaurant WHERE customer_id = $1;",[user.user_id]);
        await db.query("DELETE FROM order_has WHERE customer_id = $1;",[user.user_id]);
        await db.query("DELETE FROM order_taken WHERE customer_id = $1;",[user.user_id]);
        await db.query("DELETE FROM gen_user WHERE username = $1;",['test_delivery']);
        await db.query("DELETE FROM gen_user WHERE username = $1;",['test_restaurant']);
        await db.query('DELETE FROM gen_user WHERE username = $1;', ["test_user_1"]);
        await db.terminate();
    })
});