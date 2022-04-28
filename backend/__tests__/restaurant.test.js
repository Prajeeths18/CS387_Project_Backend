const restaurantController = require('../controllers/customer.controller');
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
    })
    // it('[T-1] Restaurant register - Duplicate username', async () => {

    // })
    afterAll(async () => {
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_1"]);
        await db.terminate();
    })
})