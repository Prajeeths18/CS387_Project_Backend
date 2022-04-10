const model = require('../models/dummy');

async function dummy(req,res,next){
    await model.dummy();
    res.json({});
}

exports.dummy = dummy;