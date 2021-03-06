const db = require('../db');
const pgp = require('pg-promise');
const bcrypt = require('bcrypt');

async function register(username, password, vaccination_status, mobile, email) {
    const query = `
    WITH usid AS (
        INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'DELIVERY') RETURNING user_id
    )
    INSERT INTO delivery (delivery_id,mobile_no,email,vaccination_status) SELECT user_id,$3,$4,$5 FROM usid;
    `
    if(password) {
    // console.log(pgp.as.format(query,[username,await bcrypt.hash(password,10),mobile,email,vaccination_status]));
        const result = await db.query(query,[username,await bcrypt.hash(password,10),mobile,email,vaccination_status]).catch(e=>e);
        return { result };
    } else {
        // console.log(username,password,vaccination_status,mobile,email)
    }
}

async function update(delivery_id, mobile, email) {
    const fetch = 'SELECT * from delivery WHERE delivery_id = $1;'
    const userDefault = await db.query(fetch,[delivery_id]).catch(e=>e);
    if (userDefault.rows.length === 0) {
        return userDefault;
    } else {
        mobile = mobile?mobile:userDefault.rows[0].mobile_no;
        email = email?email:userDefault.rows[0].email;
    }
    const updateQuery = 'UPDATE delivery SET mobile_no=$2,email=$3 WHERE delivery_id=$1;'
    const result = await db.query(updateQuery,[delivery_id, mobile, email]).catch(e=>e);
    return { result };
}

async function availability(delivery_id,available){

    const query = ` UPDATE delivery SET available=$2 WHERE delivery_id=$1;
    `
    const result = await db.query(query,[delivery_id,available]).catch(e=>e);
    return {result};
}

async function profile(delivery_id) {
    const query = 'SELECT mobile_no,email,vaccination_status FROM delivery WHERE delivery_id=$1;'
    const result = await db.query(query,[delivery_id]).catch(e=>e).then(x=>x.rows);
    return { result }
}

async function orders(delivery_id) {
    const orderQuery = 'SELECT * FROM food_order NATURAL INNER JOIN order_taken WHERE delivery_id = $1;'
    const restaurantQuery = 'SELECT * FROM order_taken NATURAL JOIN order_restaurant NATURAL INNER JOIN restaurant WHERE delivery_id = $1;'
    const orderTakenQuery = 'SELECT * FROM order_taken NATURAL INNER JOIN delivery WHERE delivery_id = $1;'
    const orderHasQuery = 'SELECT * FROM order_taken NATURAL INNER JOIN order_has NATURAL INNER JOIN order_restaurant NATURAL INNER JOIN food_items WHERE delivery_id = $1;'
    const [orderResult,restaurantResult,orderTakenResult,orderHasResult] = await Promise.all([db.query(orderQuery,[delivery_id]),db.query(restaurantQuery,[delivery_id]),db.query(orderTakenQuery,[delivery_id]),db.query(orderHasQuery,[delivery_id])])
    return {orderResult,restaurantResult,orderTakenResult,orderHasResult}
}

async function freeOrders(delivery_id) {
    const orderQuery = 'SELECT * FROM food_order NATURAL INNER JOIN order_taken WHERE delivery_id is NULL;'
    const restaurantQuery = 'SELECT * FROM order_taken NATURAL JOIN order_restaurant NATURAL INNER JOIN restaurant WHERE delivery_id is NULL;'
    const orderTakenQuery = 'SELECT * FROM order_taken NATURAL INNER JOIN delivery WHERE delivery_id is NULL;'
    const orderHasQuery = 'SELECT * FROM order_taken NATURAL INNER JOIN order_has NATURAL INNER JOIN order_restaurant NATURAL INNER JOIN food_items WHERE delivery_id is NULL;'
    const [orderResult,restaurantResult,orderTakenResult,orderHasResult] = await Promise.all([db.query(orderQuery,[delivery_id]),db.query(restaurantQuery,[delivery_id]),db.query(orderTakenQuery,[delivery_id]),db.query(orderHasQuery,[delivery_id])])
    return {orderResult,restaurantResult,orderTakenResult,orderHasResult}
}

async function acceptOrder(order_id,customer_id,delivery_id) {
    const acceptQuery = 'UPDATE order_taken SET delivery_id=$1 WHERE order_id=$2 AND customer_id=$3;'
    const acceptResult = await db.query(acceptQuery,[delivery_id,order_id,customer_id])
    return {acceptResult}
}

exports.register = register
exports.update = update
exports.availability = availability
exports.profile = profile
exports.orders = orders
exports.freeOrders = freeOrders
exports.acceptOrder = acceptOrder