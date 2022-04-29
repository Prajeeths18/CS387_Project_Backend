const restaurantModel = require('../models/restaurant.model');

async function register(req,res,next){
    res.json(
        await restaurantModel.register(
        req.body.username,
        req.body.password,
        req.body.address, 
        req.body.latitude, 
        req.body.longitude, 
        req.body.mobile, 
        req.body.email,
        req.body.overall_discount,
        req.body.max_safety_follow,
        req.body.open_time,
        req.body.close_time,
        req.body.avg_cost_for_two,
        )
    )
    
}

async function add_item(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.add_item(
            req.user.user_id,
            req.body.name,
            req.body.cost, 
            req.body.available, 
            req.body.type, 
            req.body.course_type,
            req.body.specific_discount,
            req.body.preparation_time,
            )
    )
}

async function update_details(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.update_details(
            req.user.user_id,
            req.body.mobile_no,
            req.body.email,
            req.body.address,
            req.body.latitude,
            req.body.longitude,
            req.body.overall_discount,
            req.body.max_safety_follow,
            req.body.open_time,
            req.body.close_time,
        )
    )
}

async function update_food_item(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.update_food_item(
            req.user.user_id,
            req.body.food_name,
            req.body.preparation_time,
            req.body.cost,
            req.body.available,
            req.body.specific_discount
        )
    )
}

async function delete_food_item(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.delete_food_item(
            req.user.user_id,
            req.body.food_name,
        )
    )
}

async function food_item_list(req,res,next){
    res.json(
        await restaurantModel.food_item_list(
            req.body.restaurant_id,
        )
    )

}

async function profile(req,res,next){
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.profile(
            req.user.user_id
        )
    )
}

async function orders(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.orders(
            req.user.user_id
        )
    )
}

async function freeOrders(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.freeOrders(
            req.user.user_id
        )
    )
}

async function acceptOrder(req,res,next) {
    if((!req.user) || (!req.user.valid)) {
        return res.sendStatus(500)
    }
    if(req.user.role !== 'RESTAURANT') {
        return res.sendStatus(500)
    }
    res.json(
        await restaurantModel.freeOrders(
            req.body.order_id,
            req.body.customer_id,
            req.body.preparation_time,
            req.user.user_id
        )
    )
}

exports.register = register;
exports.add_item=add_item;
exports.update_details = update_details;
exports.update_food_item = update_food_item;
exports.delete_food_item = delete_food_item;
exports.food_item_list = food_item_list;
exports.profile = profile
exports.orders = orders
exports.freeOrders = freeOrders
exports.acceptOrder = acceptOrder