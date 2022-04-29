const db = require('../db');
const pgp = require('pg-promise');
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

async function order(customer_id, restaurant_id, timestamp, latitude, longitude, food_pairs) {
    let order_id;
    const foodOrderQuery = 'INSERT INTO food_order (order_id,customer_id,order_place_time,latitude,longitude) SELECT COALESCE(MAX(order_id)+1,1),$1,$2,$3,$4 FROM food_order WHERE customer_id=$1 RETURNING order_id;'
    const orderRestaurantQuery = 'INSERT INTO order_restaurant (order_id,customer_id,restaurant_id) VALUES ($1,$2,$3);'
    const orderTakenQuery = 'INSERT INTO order_taken (order_id,customer_id,delivery_id) VALUES ($1,$2,NULL);'
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN')
        order_id = await client.query(foodOrderQuery,[customer_id,timestamp,latitude,longitude]).then(x=>x.rows[0].order_id);
        await client.query(orderRestaurantQuery,[order_id,customer_id,restaurant_id]);
        await client.query(`INSERT INTO order_has (order_id,customer_id,food_name,quantity) VALUES ${food_pairs.map((x)=>`(${order_id},${customer_id},'${x[0]}',${x[1]})`).join(',')};`)
        await client.query(orderTakenQuery,[order_id,customer_id]);
        await client.query('COMMIT');
        return {order_id};
      } catch (e) {
        await client.query('ROLLBACK')
        return e
      } finally {
        client.release()
      }
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
    const query = 'UPDATE order_taken SET delivery_review=$4,delivery_rating=$3 WHERE order_id=$1 AND customer_id=$2;'
    const result = await db.query(query,[order_id,customer_id,rating,review]).catch(e=>e);
    return {result}
}

async function profile(customer_id) {
    const customerQuery = 'SELECT mobile_no,email,subscription FROM customer WHERE customer_id=$1;'
    const addressQuery = 'SELECT gen_address FROM coordinates NATURAL INNER JOIN customer_address WHERE customer_address.customer_id=$1;'
    const [customerResult, addressResult] = await Promise.all([
        db.pool.query(customerQuery,[customer_id]).catch(e=>e).then(x=>x.rows),
        db.pool.query(addressQuery,[customer_id]).catch(e=>e).then(x=>x.rows)
    ])
    return {customerResult,addressResult}
}

async function restaurant_list(latitude,longitude){

    // const queryPos = ` select * from customer_address where customer_id = $1
    // `
    // const positions = await db.query(queryPos,[customer_id]).catch(e=>e);
    // if(positions.rows.length === 0){
    //     return positions;
    // }
    // latitude = positions.rows[0].latitude
    // longitude = positions.rows[0].longitude
    const Query = `with restDist as ( 
        select R.restaurant_id as restaurant_id,R.restaurant_name as restaurant_name, 
        ( 6371 * acos( cos( radians($1) ) * cos( radians( R.latitude ) ) 
        * cos( radians(R.longitude) - radians($2)) + sin(radians($1)) 
        * sin( radians(R.latitude)))) as distance 
        FROM restaurant as R 
     )
     select * from restDist 
     where distance <= 15;
    `
    const result = await db.query(Query,[latitude,longitude]).catch(e=>e).then(x=>x.rows);
    return {result};
}

async function orders(customer_id) {
    const orderQuery = 'SELECT * FROM food_order WHERE customer_id = $1;'
    const restaurantQuery = 'SELECT * FROM order_restaurant NATURAL INNER JOIN restaurant WHERE customer_id = $1;'
    const orderTakenQuery = 'SELECT * FROM order_taken NATURAL INNER JOIN delivery WHERE customer_id = $1;'
    const orderHasQuery = 'SELECT * FROM order_has NATURAL INNER JOIN order_restaurant NATURAL INNER JOIN food_items WHERE customer_id = $1;'
    const [orderResult,restaurantResult,orderTakenResult,orderHasResult] = await Promise.all([db.query(orderQuery,[customer_id]),db.query(restaurantQuery,[customer_id]),db.query(orderTakenQuery,[customer_id]),db.query(orderHasQuery,customer_id)])
    return {orderResult,restaurantResult,orderTakenResult,orderHasResult}
}

// with restDist as ( 
//     select R.restaurant_id as restaurant_id,R.restaurant_name as restaurant_name, 
//     ( 6371 * acos( cos( radians($1) ) * cos( radians( R.latitude ) ) 
//     * cos( radians(R.longitude) - radians($2)) + sin(radians($1)) 
//     * sin( radians(R.latitude)))) as distance 
//     FROM restaurant as R 
//  )
//  select * from restDist 
//  where distance > 15;

exports.register = register;
exports.update = update;
exports.add_address = add_address;
exports.delete_address = delete_address;
exports.update_address = update_address;
exports.restaurant_review = restaurant_review;
exports.food_review = food_review;
exports.delivery_review = delivery_review;
exports.order = order;
exports.profile = profile;
exports.restaurant_list = restaurant_list;
exports.orders = orders