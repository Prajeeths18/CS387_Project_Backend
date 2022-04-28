const registerModel = require('../models/customer.register');

async function register(req,res,next){
    res.json(await registerModel.register(
        req.body.username,
        req.body.password,
        req.body.address, 
        req.body.latitude, 
        req.body.longitude, 
        req.body.mobile, 
        req.body.email
        ));
    res.json({});
}

exports.register = register;

//req.user.user_id //req.user.