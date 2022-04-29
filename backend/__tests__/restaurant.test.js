const restaurantController = require('../controllers/restaurant.controller');
const db = require('../db');
var assert = require('assert');
var user;
describe('Restaurant test suite',() => {
    beforeAll(async () => {
        db.init()
    })
    it('[T-0] Restaurant register - Success', async () => {
        const req = { body: {
                                "username": "test_user_2",
                                "password": "dummy_password",
                                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                                "latitude": 28.53538174,
                                "longitude": 77.19692286,
                                "mobile": 9999999999,
                                "email": "test_user_1@test.com",
                                "overall_discount":0,
                                "max_safety_follow":"f",
                                "open_time":"9:30",
                                "close_time":"14:30",
                                "avg_cost_for_two":1232,
                                // overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two
                                
                            } }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.register(req,res,next);
        user = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_2"]).catch(e=>e).then(x=>x.rows[0]);

        //console.log(res)
        expect(res.result.result.rowCount).toBe(1);
    })

    it('[T-1] Restaurant register - Duplicate username', async () => {
            const req = { body: {
                "username": "test_user_2",
                "password": "dummy_password",
                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                "latitude": 28.53538174,
                "longitude": 77.19692286,
                "mobile": 9999999999,
                "email": "test_user_1@test.com",
                "overall_discount":10,
                "max_safety_follow":"no",
                "open_time":"9:30",
                "close_time":"14:30",
                "avg_cost_for_two":1232,
                
            } }
    let res = {};
    res.sendStatus = (x) => {res.status = x};
    res.json = (x) => { res.result = x };
    let next = () => {}
    await restaurantController.register(req,res,next);
    expect(res.result.result.severity).toBe("ERROR");
    //console.log(res) 
    expect(res.result.result.detail).toBe('Key (username)=(test_user_2) already exists.');
})

    it('[T-2] add-item success',async () => {
        const req = { body: {
                                "name": "kadaipoori",
                                "cost": 200,
                                "available": true,
                                "type": 'VEG',
                                "course_type": 'STARTERS',
                                "specific_discount": 5,
                                "preparation_time":10,
                                
                            } ,
                        user:user
                        }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.add_item(req,res,next);
        temp = await db.query("SELECT * FROM food_type WHERE food_name=$1",["kadaipoori"]).catch(e=>e).then(x=>x.rows[0]);
        //expect(res.result.result.rowCount).toBe(1);
        expect(temp.food_name ).toBe("kadaipoori")
    })

    it('[T-3] add-item fail',async () => {
        const req = { body: {
                                "name": "kadaipoori",
                                "cost": 200,
                                "available": true,
                                "type": 'NON_VEG',
                                "course_type": 'STARTERS',
                                "specific_discount": 5,
                                "preparation_time":10
                                
                            } ,
                        user:user}
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.add_item(req,res,next);
        //console.log(res)
        expect(res.result.result.severity).toBe("ERROR")
        //temp = await db.query("SELECT * FROM food_type WHERE food_name=$1",["poori"]).catch(e=>e).then(x=>x.rows[0]);
        //expect(res.result.result.severity).toBe("ERROR");

    })

    it('[T-4] Update Details - Success', async () => {
        const req = { body: {
                                "username": "test_user_2",
                                "password": "dummy_password",
                                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                                "latitude": 28.53538174,
                                "longitude": 77.19692286,
                                "mobile": 9999999998,
                                "email": "test_user_1@test.com",
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.update_details(req,res,next);
        //console.log(res)
        temp = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_2"]).catch(e=>e).then(x=>x.rows[0]);
         //console.log(temp)
        expect(temp.username).toBe("test_user_2");

    })

    it('[T-5] Update Details - Failure', async () => {
        const req = { body: {
                                "username": "test_user_3",
                                "password": "dummy_password",
                                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                                "latitude": 28.53538174,
                                "longitude": 77.19692286,
                                "mobile": 9999999999,
                                "email": "test_user_1@test.com",
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.update_details(req,res,next);
        //console.log(res.result.result)
        temp = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_3"]).catch(e=>e).then(x=>x.rows[0]);
        //expect(res.result.result.severity).toBe("ERROR");
        expect(temp).toBe(undefined)
    })

    it('[T-5] Update Details - Failure', async () => {
        const req = { body: {
                                "username": "test_user_2",
                                "password": "dummy_password",
                                "address": null,
                                "latitude": 28.53538174,
                                "longitude": 77.19692286,
                                "mobile": 9999999999,
                                "email": "test_user_1@test.com",
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.update_details(req,res,next);
        console.log(res)
        //console.log(res.result.result)
        //temp = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_3"]).catch(e=>e).then(x=>x.rows[0]);
        //expect(res.result.result.severity).toBe("ERROR");
       // expect(temp).toBe(undefined)
    })

    it('[T-6] Update FoodItem - Success', async () => {
        const req = { body: {
                                "food_name": "kadaipoori",
                                "cost": 300,
                                "available": true,
                                "specific_discount": 15,
                                "preparation_time":12,
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.update_food_item(req,res,next);
        //console.log(res.result.result)
        temp = await db.query("SELECT * FROM food_items WHERE food_name=$1",["kadaipoori"]).catch(e=>e).then(x=>x.rows[0]);
        //expect(res.result.result.rowCount).toBe(1);
        //console.log("t2",temp)
        expect(temp.food_name).toBe("kadaipoori")
        expect(temp.cost).toBe(300)

    })

    it('[T-7] Update FoodItem - Failure', async () => {
        const req = { body: {
                                "food_name": "chingpingpao",
                                "cost": 300,
                                "available": true,
                                "specific_discount": 15,
                                "preparation_time":12,
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.update_food_item(req,res,next);
        temp = await db.query("SELECT * FROM food_items WHERE food_name=$1",["chingpingpao"]).catch(e=>e).then(x=>x.rows[0]);        //expect(res.result.result.severity).toBe("ERROR");
        expect(temp).toBe(undefined)
        //expect(res.result.rowCount).toBe(0);
        //console.log(res)

    })

    it('[T-8] Delete FoodItem - Failure', async () => {
        const req = { body: {
                                "food_name": "kadaipooriching",
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.delete_food_item(req,res,next);
        temp = await db.query("SELECT * FROM food_type WHERE food_name=$1",["kadaipoori"]).catch(e=>e).then(x=>x.rows[0]);
        //expect(res.result.result.severity === "ERROR");
        //expect(res.result.rowCount ===0);
        //console.log(res)
        expect(temp.food_name).toBe("kadaipoori")
    })

    it('[T-9] Delete FoodItem - Success', async () => {
        const req = { body: {
                                "food_name": "kadaipoori",
                                
                            },
                        user: user }
        let res = {};
        res.sendStatus = (x) => {res.status = x};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.delete_food_item(req,res,next);
        //expect(res.result.rowCount === 2);
        temp = await db.query("SELECT * FROM food_type WHERE food_name=$1",["kadaipoori"]).catch(e=>e).then(x=>x.rows[0]);
        expect(res.result.result[0].rowCount).toBe(1)
       
    })

    

    it('[T-10] Update - Invalid auth', async () => {
        let req = {
            body: {
                "username": "test_user_2",
                "password": "dummy_password",
                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                "latitude": 28.53538174,
                "longitude": 77.19692286,
                "mobile": 9999999999,
                "email": "test_user_1@test.com",
            }
        }
        let res = {}
        res.json = (x) => { res.result = x};
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        await restaurantController.update_details(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await restaurantController.add_item(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await restaurantController.update_food_item(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await restaurantController.delete_food_item(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user = user;
        req.user.role = 'CUSTOMER';
        await restaurantController.update_details(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await restaurantController.update_food_item(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await restaurantController.add_item(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        await restaurantController.delete_food_item(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user.role = 'RESTAURANT';
        req.user.valid = false;
        await restaurantController.update_details(req,res,next);
        expect(res.status).toBe(500);
        expect(res.result).toBe(undefined);
        req.user.valid = true;
    })

    afterAll(async () => {
        await db.query('DELETE FROM food_items WHERE food_name = $1', ["kadaipoori"]);
        await db.query('DELETE FROM food_type WHERE food_name = $1', ["kadaipoori"]);
        await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_2"]);
        await db.terminate();
    })
})