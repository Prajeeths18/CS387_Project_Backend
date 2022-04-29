const customerModel = require('../models/customer.model');

async function register(req,res,next){
    res.json(
        await customerModel.register(
            req.body.username,
            req.body.password,
            req.body.address, 
            req.body.latitude, 
            req.body.longitude, 
            req.body.mobile, 
            req.body.email
        )
    );
    // res.json({});
}

async function update(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.update(
            req.user.user_id,
            req.body.mobile,
            req.body.email
        )
    );
}

async function add_address(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.add_address(
            req.user.user_id,
            req.body.address,
            req.body.latitude,
            req.body.longitude
        )
    );
}

async function delete_address(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.delete_address(
            req.user.user_id,
            req.body.latitude,
            req.body.longitude
        )
    );
}

async function update_address(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.update_address(
            req.user.user_id,
            req.body.old_latitude,
            req.body.old_longitude,
            req.body.address,
            req.body.latitude,
            req.body.longitude
        )
    );
}

async function order(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.order(
            req.user.user_id,
            req.body.restaurant_id,
            req.body.timestamp,
            req.body.latitude,
            req.body.longitude,
            req.body.food_pairs
        )
    );
}

async function restaurant_review(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.restaurant_review(
            req.body.order_id,
            req.user.user_id,
            req.body.restaurant_id,
            req.body.rating,
            req.body.review
        )
    );
}

async function food_review(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.food_review(
            req.body.order_id,
            req.user.user_id,
            req.body.rating,
            req.body.review,
            req.body.food_name
        )
    );
}

async function delivery_review(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.delivery_review(
            req.body.order_id,
            req.user.user_id,
            req.body.rating,
            req.body.review
        )
    );
}

async function restaurant_list(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.restaurant_list(
            req.body.latitude,
            req.body.longitude,
        )
    );
}

async function profile(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'CUSTOMER') {
        return res.sendStatus(500)
    }
    res.json(
        await customerModel.profile(
            req.user.user_id
        )
    )
}

exports.register = register;
exports.update = update;
exports.add_address = add_address;
exports.delete_address = delete_address;
exports.update_address = update_address;
exports.restaurant_review = restaurant_review;
exports.food_review = food_review;
exports.delivery_review = delivery_review;
exports.order = order;
exports.restaurant_list = restaurant_list;
exports.profile = profile;

//req.user.user_id //req.user.