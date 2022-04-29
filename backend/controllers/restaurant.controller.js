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
    res.json(
        
    await restaurantModel.add_item(
        req.body.restaurant_id,
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
    res.json(
        await restaurantModel.update_details(
            req.body.restaurant_id,
            req.body.mobile_no,
            req.body.email,
            req.body.address,
            req.body.overall_discount,
            req.body.max_safety_follow,
            req.body.open_time,
            req.body.close_time,
        )
    )
}

async function update_food_item(req,res,next){
    res.json(
        await restaurantModel.update_food_item(
            req.body.restaurant_id,
            req.body.food_name,
            req.body.preparation_time,
            req.body.cost,
            req.body.available,
            req.body.specific_discount
        )
    )
}

async function delete_food_item(req,res,next){
    res.json(
        await restaurantModel.delete_food_item(
            req.body.restaurant_id,
            req.body.food_name,
            req.body.order_id,
            req.body.customer_id,
        )
    )
}

exports.register = register;
exports.add_item=add_item;
exports.update_details = update_details;
exports.update_food_item = update_food_item;
exports.delete_food_item = delete_food_item;