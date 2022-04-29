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

//         - $4=cost,$5=available,$6=specific_discount $3=preparation_time

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
        INSERT INTO coordinates (latitude, longitude, gen_address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
    )
    INSERT INTO restaurant (restaurant_id,restaurant_name,mobile_no,email,overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two,latitude,longitude) SELECT user_id,$1,$6,$7,$8,$9,$10,$11,$12,$4,$5 FROM usid; 
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

async function update_details(restaurant_id,mobile_no,email,address,latitude,longitude,overall_discount,max_safety_follow,open_time,close_time)  
{

    const queryRest = ` SELECT * FROM restaurant WHERE restaurant_id=$1;
    `
    const userDefault = await db.query(queryRest,[restaurant_id]).catch(e=>e);
    if(address===null || address===undefined){
        //console.log("hello gius")
        //console.log(latitude,longitude)
        if((latitude!==undefined && latitude!==null) || (longitude!==undefined && longitude!==null) ){
            //console.log("what the fck")
            return ;
        }
    }
    if (userDefault.rows.length === 0) {
        return userDefault;
    } else {
        mobile_no = mobile_no?mobile_no:userDefault.rows[0].mobile_no;
        email = email?email:userDefault.rows[0].email;
        latitude = latitude?latitude:userDefault.rows[0].latitude;
        longitude = longitude?longitude:userDefault.rows[0].longitude;
        overall_discount = overall_discount?overall_discount:userDefault.rows[0].overall_discount;
        max_safety_follow = max_safety_follow?max_safety_follow:userDefault.rows[0].max_safety_follow;
        open_time = open_time?open_time:userDefault.rows[0].open_time;
        close_time = close_time?close_time:userDefault.rows[0].close_time;
    }
    const queryUpdate1 = ` UPDATE restaurant SET mobile_no=$2,email=$3,latitude=$4,longitude=$9,
    overall_discount=$5,max_safety_follow=$6,open_time=$7,close_time=$8 WHERE restaurant_id=$1;
    `

    const queryUpdate2 = `INSERT INTO coordinates (latitude, longitude, gen_address) VALUES
     ($1,$2,$3) ON CONFLICT (latitude,longitude) DO NOTHING  `

    const result = await db.transaction([queryRest,queryUpdate1,queryUpdate2],[[restaurant_id],[restaurant_id,mobile_no,email,latitude,overall_discount,max_safety_follow,open_time,close_time,longitude],[latitude,longitude,address]]).catch(e=>e);
    return {result};

}

async function update_food_item(restaurant_id,food_name,preparation_time,cost,available,specific_discount){
    
    const queryFood = ` SELECT * FROM food_items,food_type WHERE food_items.food_name=food_type.food_name AND food_items.food_name=$2 AND food_items.restaurant_id=$1;
    `
    const userDefault = await db.query(queryFood,[restaurant_id,food_name]).catch(e=>e);
    if (userDefault.rows.length === 0) {
        return userDefault;
    } else {
        preparation_time = preparation_time?preparation_time:userDefault.rows[0].preparation_time;
        cost = cost?cost:userDefault.rows[0].cost;
        available = available?available:userDefault.rows[0].available;
        specific_discount = specific_discount?specific_discount:userDefault.rows[0].specific_discount;     
    }
    const queryUpdate = ` UPDATE food_items SET preparation_time=$3,cost=$4,available=$5,specific_discount=$6 WHERE restaurant_id=$1 AND food_name=$2;
    `

    const result = await db.transaction([queryFood,queryUpdate],[[restaurant_id,food_name],[restaurant_id,food_name,preparation_time,cost,available,specific_discount]]).catch(e=>e);
    return {result};
    
    //         QUERY 1: SELECT * FROM food_items,food_type WHERE food_items.food_name=food_type.food_name AND food_items.food_name=$2 AND food_items.restaurant_id=$1;
    
    //          $4=cost,$5=available,$6=specific_discount $3=preparation_time
    
    //         QUERY 2:
    //         UPDATE food_items SET cost=$4,available=$5,specific_discount=$6 WHERE restaurant_id=$1 AND food_name=$2;

}

async function delete_food_item(restaurant_id,food_name){

//         - $1=restaurant_id, $2=food_name

//         DELETE FROM food_items WHERE restaurant_id=$1 AND food_name=$2;

const queryDel = `  DELETE FROM food_items WHERE restaurant_id=$1 AND food_name=$2;
    `
    const result = await db.transaction([queryDel],[[restaurant_id,food_name]]).catch(e=>e);
    return {result};
}

async function food_item_list(restaurant_id){
    const queryList = ` select * from food_items where restaurant_id = $1 and available = true
    `
    const result = await db.query(queryList,[restaurant_id]).catch(e=>e);
    return {result};
}



exports.register = register
exports.add_item=add_item
exports.update_details = update_details
exports.update_food_item = update_food_item
exports.delete_food_item = delete_food_item
exports.food_item_list = food_item_list