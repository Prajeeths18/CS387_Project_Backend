const db = require('../db');
// const pgp = require('pg-promise');
const bcrypt = require('bcrypt');

async function register(username, password, address, latitude, longitude, mobile, email) {
    const query = `
        WITH usid AS (
            INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'CUSTOMER') RETURNING user_id
        ), q1 AS (
            INSERT INTO coordinates (latitude, longitude, gen_address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
        ), q2 AS (
            INSERT INTO customer (customer_id,mobile_no,email) SELECT user_id,$6,$7 FROM usid
        )
        INSERT INTO customer_address (customer_id,latitude,longitude) SELECT user_id,$4,$5 FROM usid;
    `
    // console.log(pgp.as.format(query,[username,await bcrypt.hash(password,10),address,latitude,longitude,mobile,email]));
    const result = await db.query(query,[username,await bcrypt.hash(password,10),address,latitude,longitude,mobile,email]).catch(e=>e);
    return { result };
}

async function update(customer_id, mobile, email) {
    const fetch = 'SELECT * from customer WHERE customer_id = $1;'
    const userDefault = await db.query(fetch,[customer_id]).catch(e=>e);
    if (userDefault.rows.length === 0) {
        return userDefault;
    } else {
        mobile = mobile?mobile:userDefault.rows[0].mobile_no;
        email = email?email:userDefault.rows[0].email;
    }
    const updateQuery = 'UPDATE customer SET mobile_no=$2,email=$3 WHERE customer_id=$1;'
    const result = await db.query(updateQuery,[customer_id, mobile, email]).catch(e=>e);
    return { result };
}

async function add_address(customer_id, address, latitude, longitude) {
    const insertGen = 'INSERT INTO coordinates (latitude, longitude, gen_address) VALUES ($2,$3,$1) ON CONFLICT (latitude,longitude) DO NOTHING;'
    const insertCustomerAddress = 'INSERT INTO customer_address (customer_id,latitude,longitude) SELECT $1,$2,$3;';
    const result = await db.transaction([insertGen,insertCustomerAddress],[[address,latitude,longitude],[customer_id,latitude,longitude]]).catch(e=>e);
    return {result};
}

async function delete_address(customer_id, latitude, longitude) {
    const delQuery = 'DELETE FROM customer_address WHERE customer_id=$1 AND latitude=$2 AND longitude=$3;'
    const result = await db.query(delQuery,[customer_id,latitude,longitude]);
    return {result}
}

async function update_address(customer_id,old_latitude,old_longitude,address,latitude,longitude) {
    const delQuery = 'DELETE FROM customer_address WHERE customer_id=$1 AND latitude=$2 AND longitude=$3;'
    const insertGen = 'INSERT INTO coordinates (latitude, longitude, gen_address) VALUES ($2,$3,$1) ON CONFLICT (latitude,longitude) DO NOTHING;'
    const insertCustomerAddress = 'INSERT INTO customer_address (customer_id,latitude,longitude) SELECT $1,$2,$3;';
    const result = await db.transaction([delQuery,insertGen,insertCustomerAddress],[[customer_id,old_latitude,old_longitude],[address,latitude,longitude],[customer_id,latitude,longitude]]).catch(e=>e);
    return {result};
}

async function restaurant_review(order_id, customer_id, restaurant_id, rating, review) {
    const query = 'UPDATE order_restaurant SET restaurant_review=$4,restaurant_rating=$3 WHERE order_id=$1 AND customer_id=$2 AND restaurant_id=$5;'
    const result = await db.query(query,[order_id,customer_id,rating,review,restaurant_id]).catch(e=>e);
    return {result}
}

async function food_review(order_id, customer_id, rating, review, food_name) {
    const query = 'UPDATE order_has SET food_rating=$3,food_review=$4 WHERE order_id=$1 AND customer_id=$2 AND food_name=$5;'
    const result = await db.query(query,[order_id,customer_id,rating,review,food_name]).catch(e=>e);
    return {result}
}

async function delivery_review(order_id, customer_id, rating, review) {
    const query = 'UPDATE order_taken SET delivery_review=$3,delivery_rating=$3 WHERE order_id=$1 AND customer_id=$2;'
    const result = await db.query(query,[order_id,customer_id,rating,review]).catch(e=>e);
    return {result}
}

exports.register = register;
exports.update = update;
exports.add_address = add_address;
exports.delete_address = delete_address;
exports.update_address = update_address;
exports.restaurant_review = restaurant_review;
exports.food_review = food_review;
exports.delivery_review = delivery_review;