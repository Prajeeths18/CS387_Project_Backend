const restaurantController = require('../controllers/restaurant.controller');
const db = require('../db');

describe('Restaurant test suite',() => {
    beforeAll(async () => {

    })
    it('[T-0] Restaurant register - Success', async () => {
        const req = { body: {
                                "username": "test_user_1",
                                "password": "dummy_password",
                                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                                "latitude": 28.53538174,
                                "longitude": 77.19692286,
                                "mobile": 9999999999,
                                "email": "test_user_1@test.com",
                                
                            } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.register(req,res,next);
        user = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_1"]).catch(e=>e).then(x=>x.rows[0]);
        expect(res.result.rowCount === 1);
        console.log(res.result)
    })

    it('[T-1] Restaurant register - Duplicate username', async () => {
            const req = { body: {
                "username": "test_user_1",
                "password": "dummy_password",
                "address": "84, Near Honda Showroom, Adchini, New Delhi",
                "latitude": 28.53538174,
                "longitude": 77.19692286,
                "mobile": 9999999999,
                "email": "test_user_1@test.com",
                "overall_discount":10,
                "max_safety_follow":"no",
                
                
            } }
    let res = {};
    res.json = (x) => { res.result = x };
    let next = () => {}
    await restaurantController.register(req,res,next);
    expect(res.result.severity === "ERROR");
    expect(res.result.detail === 'Key (username)=(test_user_1) already exists.');
})

    it('[T-2] add-item success',async () => {
        const req = { body: {
                                "restaurant_id": "test_user_1",
                                "name": "poori",
                                "cost": 200,
                                "available": true,
                                "type": 'VEG',
                                "course_type": 'STARTERS',
                                "specific_discount": 5,
                                "preparation_time":10
                                
                            } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.add_item(req,res,next);
        user = await db.query("SELECT * FROM food_type WHERE food_name=$1",["poori"]).catch(e=>e).then(x=>x.rows[0]);
        expect(res.result.rowCount === 1);
    })

    it('[T-3] add-item fail',async () => {
        const req = { body: {
                                "restaurant_id": "test_user_1",
                                "name": "poori",
                                "cost": 200,
                                "available": true,
                                "type": 'NON_VEG',
                                "course_type": 'STARTERS',
                                "specific_discount": 5,
                                "preparation_time":10
                                
                            } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await restaurantController.add_item(req,res,next);
        user = await db.query("SELECT * FROM food_type WHERE food_name=$1",["poori"]).catch(e=>e).then(x=>x.rows[0]);
        expect(res.result.result.severity === "ERROR");

    })

    // it('[T-4] Update Details - Success', async () => {
    //     const req = { body: {
    //                             "username": "test_user_1",
    //                             "password": "dummy_password",
    //                             "address": "84, Near Honda Showroom, Adchini, New Delhi",
    //                             "latitude": 28.53538174,
    //                             "longitude": 77.19692286,
    //                             "mobile": 9999999999,
    //                             "email": "test_user_1@test.com",

    //                             restaurant_id,mobile_no,email,address,overall_discount,max_safety_follow,open_time,close_time
                                
    //                         } }
    //     let res = {};
    //     res.json = (x) => { res.result = x };
    //     let next = () => {}
    //     await restaurantController.register(req,res,next);
    //     user = await db.query("SELECT user_id,username,role,valid FROM gen_user WHERE username=$1",["test_user_1"]).catch(e=>e).then(x=>x.rows[0]);
    //     expect(res.result.rowCount === 1);
    // })

    afterAll(async () => {
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_1"]);
        const trial1 = await db.query('DELETE FROM food_type WHERE food_name = $1', ["poori"]);
        await db.terminate();
    })
})