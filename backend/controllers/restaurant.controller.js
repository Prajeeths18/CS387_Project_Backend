const restaurantModel = require('../models/restaurant.model');

async function register(req,res,next){
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
        );
    res.json({});
}

async function add_item(req,res,next){
    await restaurantModel.add_item(
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
        );
    res.json({});
}



exports.register = register;
exports.add_item=add_item;