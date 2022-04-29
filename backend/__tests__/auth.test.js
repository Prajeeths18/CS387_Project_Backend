const authController = require('../controllers/auth.controller');
const customerController = require('../controllers/customer.controller');
const auth = require('../models/auth');
const db = require('../db');

describe('Authentication Routes test suite',() => {
    beforeAll(async () => {
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
    })
    it('[T-0] Login Success',async () => {
        let req = { body: {
                                "username": "test_user_1",
                                "password": "dummy_password"
                            } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await authController.login(req,res,next);
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
        expect(res.result !== null);
        res.sendStatus = (x) => {res.status = x};
        req.headers = {"authorization": `Bearer ${res.result}`}
        auth.authenticateToken(req,res,next);
        expect(req.user.username === "test_user_1")
        expect(req.user.role === "CUSTOMER")
        expect(req.user.valid === true)
    }),
    it('[T-1] Login Failure - Wrong Password/Username', async () => {
        let req = { body: {
                        "username": "test_user_1",
                        "password": "wrong_dummy_password"
                    } }
        let res = {};
        res.json = (x) => { res.result = x };
        let next = () => {}
        await authController.login(req,res,next)
        expect(res.result === null);

        req = { body: {
                        "username": 1,
                        "password": "wrong_dummy_password"
                    } }
        res = {};
        res.json = (x) => { res.result = x };
        next = () => {}
        await authController.login(req,res,next)
        expect(res.result === null);
    })
    it('[T-2] Auth Error - No token', async () => {
        let req = {}
        req.headers = {"authorization": `Bearer`}
        let res = {};
        res.json = (x) => { res.result = x };
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        auth.authenticateToken(req,res,next);
        expect(res.status === 401)
        expect(req.user === null)
    })
    it('[T-3] Auth Error - Bad token', async () => {
        let req = {}
        req.headers = {"authorization": `Bearer abcdyouareidiot`}
        let res = {};
        res.json = (x) => { res.result = x };
        res.sendStatus = (x) => {res.status = x};
        let next = () => {}
        auth.authenticateToken(req,res,next);
        expect(res.status === 403)
        expect(req.user === null)
    })
    afterAll(async ()=>{
        const trial = await db.query('DELETE FROM gen_user WHERE username = $1', ["test_user_1"]);
        await db.terminate();
    })
});