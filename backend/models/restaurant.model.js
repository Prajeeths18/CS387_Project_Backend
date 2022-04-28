const db = require('../db');
// - REGISTER 
//         - Arguments 
//         - $1=username, $2=password 
//         - $3=address, $4=latitude, $5=longitude
//         - $6=mobile_no, $7=email, $8=overall_discount, $9=max_safety_follow, $10=open_time, $11=close_time, $12=avg_cost_for_two
        
//         BEGIN;
//         WITH usid AS (
//             INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'RESTAURANT') RETURNING user_id
//         ), q1 AS (
//             INSERT INTO gen_address (latitude, longitude, address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
//         )
//         INSERT INTO restaurant (restaurant_id,restaurant_name,mobile_no,email,overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two,latitude,longitude) SELECT (user_id,$6,$7,$8,$9,$10,$11,$12,$4,$5) FROM usid; 
//         COMMIT;
//     - ADD_ITEM
//         - Arguments
//         - $1=restaurant_id
//         - $2=name,$3=cost,$4=available,$5=type,$6=course_type,$7=specific_discount,$8=preparation_time

//         INSERT INTO food_type (food_name,food_type,course_type) VALUES ($2,$5,$6) ON CONFLICT (food_name) DO NOTHING;
//         INSERT INTO food_items (restaurant_id,food_name,available,preparation_time,specific_discount,cost) VALUES ($1,$2,$4,$8,$7,$3);
//     - UPDATE_DETAILS
//         - Arguments
//         - $1=restaurant_id

//         QUERY 1: SELECT * FROM restaurant WHERE restaurant_id=$1;

//         - $2=mobile_no,$3=email,$4=address,$5=overall_discount,$6=max_safety_follow,$7=open_time,$8=close_time

//         QUERY 2:

//         UPDATE restaurant SET mobile_no=$2,email=$3,address=$4,overall_discount=$5,max_safety_follow=$6,open_time=$7,close_time=$8 WHERE restaurant_id=$1;

//     - UPDATE_FOOD_ITEM
//         - Arguments
//         - $1=restaurant_id, $2=food_name

//         QUERY 1: SELECT * FROM food_items,food_type WHERE food_items.food_name=food_type.food_name AND food_items.food_name=$2 AND food_items.restaurant_id=$1;

//         - $4=cost,$5=available,$6=specific_discount

//         QUERY 2:
//         UPDATE food_items SET cost=$4,available=$5,specific_discount=$6 WHERE restaurant_id=$1 AND food_name=$2;

//     - DELETE_FOOD_ITEM
//         - Arguments
//         - $1=restaurant_id, $2=food_name

//         DELETE FROM food_items WHERE restaurant_id=$1 AND food_name=$2;

//     - ORDER_ACTION
//         - Arguments
//         - order_id=$1,customer_id=$2

//         UPDATE food_order SET expected_delivery_time=0 WHERE order_id=$1,customer_id=$2;
async function register(username, password, address, latitude, longitude, mobile, email,overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two) {
    const query = `
    WITH usid AS (
        INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'RESTAURANT') RETURNING user_id
    ), q1 AS (
        INSERT INTO gen_address (latitude, longitude, address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
    )
    INSERT INTO restaurant (restaurant_id,restaurant_name,mobile_no,email,overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two,latitude,longitude) SELECT (user_id,$6,$7,$8,$9,$10,$11,$12,$4,$5) FROM usid; 
    `
    const result = await db.query(query,[username,password,address,latitude,longitude,mobile,email,overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two]).catch(e=>e);
    return { result };
}

async function add_item(restaurant_id, name, cost, available, type, course_type, specific_discount,preparation_time) {
    const queryType = `
    INSERT INTO food_type (food_name,food_type,course_type) VALUES ($1,$2,$3) ON CONFLICT (food_name) DO NOTHING;
    `
    const queryItem =
    `
    INSERT INTO food_items (restaurant_id,food_name,available,preparation_time,specific_discount,cost) VALUES ($1,$2,$3,$4,$5,$6);
    `

    const result = await db.transaction([queryType,queryItem],[[name, type, course_type], [restaurant_id, name, available, preparation_time, specific_discount, cost]]).catch(e=>e);
    return { result };
}

exports.register = register
exports.add_item=add_item