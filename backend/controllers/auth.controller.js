const authModel = require('../models/user.auth');

async function login(req,res,next){
    res.json(await authModel.login(
        req.body.username,
        req.body.password,
    ));
    // res.json({});
}

exports.login = login;