COMMON
    - LOGIN  
        - Arguments - $1=username, $2=password
        - SELECT user_id, role FROM gen_user WHERE username = $1 AND password = $2
RESTAURANT
    - REGISTER 
        - Arguments 
        - $1=username, $2=password 
        - $3=address, $4=latitude, $5=longitude
        - $6=mobile_no, $7=email, $8=overall_discount, $9=max_safety_follow, $10=open_time, $11=close_time, $12=avg_cost_for_two
        
        BEGIN;
        WITH usid AS (
            INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'RESTAURANT') RETURNING user_id
        ), q1 AS (
            INSERT INTO gen_address (latitude, longitude, address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
        )
        INSERT INTO restaurant (restaurant_id,restaurant_name,mobile_no,email,overall_discount,max_safety_follow,open_time,close_time,avg_cost_for_two,latitude,longitude) SELECT (user_id,$6,$7,$8,$9,$10,$11,$12,$4,$5) FROM usid; 
        COMMIT;
    - ADD_ITEM
        - Arguments
        - $1=restaurant_id
        - $2=name,$3=cost,$4=available,$5=type,$6=course_type,$7=specific_discount,$8=preparation_time

        INSERT INTO food_type (food_name,food_type,course_type) VALUES ($2,$5,$6) ON CONFLICT (food_name) DO NOTHING;
        INSERT INTO food_items (restaurant_id,food_name,available,preparation_time,specific_discount,cost) VALUES ($1,$2,$4,$8,$7,$3);
    - UPDATE_DETAILS
        - Arguments
        - $1=restaurant_id

        QUERY 1: SELECT * FROM restaurant WHERE restaurant_id=$1;

        - $2=mobile_no,$3=email,$4=address,$5=overall_discount,$6=max_safety_follow,$7=open_time,$8=close_time

        QUERY 2:

        UPDATE restaurant SET mobile_no=$2,email=$3,address=$4,overall_discount=$5,max_safety_follow=$6,open_time=$7,close_time=$8 WHERE restaurant_id=$1;

    - UPDATE_FOOD_ITEM
        - Arguments
        - $1=restaurant_id, $2=food_name

        QUERY 1: SELECT * FROM food_items,food_type WHERE food_items.food_name=food_type.food_name AND food_items.food_name=$2 AND food_items.restaurant_id=$1;

        - $4=cost,$5=available,$6=specific_discount

        QUERY 2:
        UPDATE food_items SET cost=$4,available=$5,specific_discount=$6 WHERE restaurant_id=$1 AND food_name=$2;

    - DELETE_FOOD_ITEM
        - Arguments
        - $1=restaurant_id, $2=food_name

        DELETE FROM food_items WHERE restaurant_id=$1 AND food_name=$2;

    - ORDER_ACTION
        - Arguments
        - order_id=$1,customer_id=$2

        UPDATE food_order SET expected_delivery_time=0 WHERE order_id=$1,customer_id=$2;

CUSTOMER
    - REGISTER
        - Arguments 
        - $1=username, $2=password
        - $3=address, $4=latitude, $5=longitude
        - $6=mobile, $7=email
        
        BEGIN;
        WITH usid AS (
            INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'CUSTOMER') RETURNING user_id
        ), q1 AS (
            INSERT INTO gen_address (latitude, longitude, address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING
        ), q2 AS (
            INSERT INTO customer (customer_id,mobile_no,email,latitude,longitude) SELECT (user_id,$6,$7,$4,$5) FROM usid
        )
        INSERT INTO customer_address (customer_id,latitude,longitude) SELECT (user_id,$4,$5) FROM usid;
        COMMIT;

    - UPDATE_DETAILS
        - Arguments
        - $1=customer_id

        QUERY 1: SELECT * FROM customer WHERE customer_id=$1;

        - $2=mobile_no,$3=email

        QUERY 2: UPDATE customer SET mobile_no=$2,email=$3 WHERE customer_id=$1;

    - ADD_NEW_ADDRESS
        - Arguments
        - $1=customer_id
        - $3=address, $4=latitude, $5=longitude

        INSERT INTO gen_address (latitude, longitude, address) VALUES ($4,$5,$3) ON CONFLICT (latitude,longitude) DO NOTHING;
        INSERT INTO customer_address (customer_id,latitude,longitude) VALUES ($1,$4,$5);
    
    - DELETE_ADDRESS
        - Arguments
        - $1=customer_id
        - $2=latitude, $3=longitude

        DELETE customer_address WHERE customer_id=$1 AND latitude=$2 AND longitude=$3;
    
    - UPDATE_ADDRESS
        - DELETE_ADDRESS
        - ADD_NEW_ADDRESS

    - GIVE_RESTAURANT_REVIEW
        - Arguments
        - $1=order_id,$2=customer_id
        - $3=restaurant_rating,$4=restaurant_review

        UPDATE food_order SET restaurant_review=$4,restaurant_rating=$3 WHERE order_id=$1 AND customer_id=$2;

    - GIVE_FOOD_ITEM_REVIEW
        - Arguments
        - $1=order_id,$2=customer_id,$5=food_name
        - $3=food_rating,$4=food_review

        UPDATE order_has SET food_rating=$3,food_review=$4 WHERE order_id=$1,customer_id=$2,food_name=$5;
    
    - GIVE_DELIVERY_REVIEW
        - Arguments
        - $1=order_id,$2=customer_id
        - $3=delivery_rating,$4=delivery_review

        UPDATE order_taken SET delivery_review=$3,delivery_rating=$3 WHERE order_id=$1,customer_id=$2;


DELIVERY
    - REGISTER
        - Arguments
        - $1=username, $2=password
        - $3=mobile_no, $4=email, $5=vaccination_status

        BEGIN;
        WITH usid AS (
            INSERT INTO gen_user (username,password,role) VALUES ($1,$2,'DELIVERY') RETURNING user_id
        )
        INSERT INTO delivery (delivery_id,mobile_no,email,vaccination_status) SELECT (user_id,$3,$4,$5) FROM usid;
        COMMIT;

    - UPDATE_DETAILS
        - Arguments
        - $1=delivery_id

        QUERY 1: SELECT * FROM delivery WHERE delivery_id=$1;

        - $2=mobile_no,$3=email

        QUERY 2: UPDATE delivery SET mobile_no=$2,email=$3 WHERE delivery_id=$1;

    - UPDATE_AVAILABILITY
        - Arguments
        - $1=delivery_id
        - $2=available

        UPDATE delivery SET available=$2 WHERE delivery_id=$1;
    
    