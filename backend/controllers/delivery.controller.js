const deliveryModel = require('../models/delivery.model');

async function register(req,res,next){
    res.json(await deliveryModel.register(
        req.body.username,
        req.body.password,
        req.body.vaccination_status,
        req.body.mobile, 
        req.body.email
        ));
}

async function update(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'DELIVERY') {
        return res.sendStatus(500)
    }
    res.json(
        await deliveryModel.update(
            req.user.user_id,
            req.body.mobile,
            req.body.email
        )
    );
}

async function availability(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'DELIVERY') {
        return res.sendStatus(500)
    }
    res.json(
        await deliveryModel.availability(
            req.user.user_id,
            req.body.available,
        )
    );
}

async function profile(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'DELIVERY') {
        return res.sendStatus(500)
    }
    res.json(
        await deliveryModel.profile(
            req.user.user_id
        )
    )
}

async function orders(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'DELIVERY') {
        return res.sendStatus(500)
    }
    res.json(
        await deliveryModel.profile(
            req.user.user_id
        )
    )
}

exports.register = register
exports.update = update
exports.availability = availability
exports.profile = profile
exports.orders = orders